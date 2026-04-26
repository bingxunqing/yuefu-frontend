export interface LyriaPromptConfig {
  clientContent: {
    weightedPrompts: Array<{
      text: string;
      weight: number;
    }>;
  };
}

export interface LyriaPlaybackControl {
  playbackControl: 'PLAY' | 'PAUSE' | 'STOP' | 'RESET_CONTEXT';
}

export interface LyriaMusicConfig {
  musicGenerationConfig: {
    bpm?: number;
    scale?: string;
    seed?: number;
  };
}

export class LyriaAudioClient {
  private ws: WebSocket | null = null;
  private url: string;
  private audioContext: AudioContext | null = null;
  private nextPlayTime: number = 0;

  public onStatusChange?: (status: string) => void;
  public onError?: (error: any) => void;

  constructor(url: string) {
    this.url = url;
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    this.updateStatus('正在连接...');
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.updateStatus('连接成功');
    };

    this.ws.onmessage = async (event) => {
      try {
        let textData = event.data;
        if (event.data instanceof Blob) {
          textData = await event.data.text();
        }

        const jsonObj = JSON.parse(textData);

        if (jsonObj.serverContent && jsonObj.serverContent.audioChunks) {
          this.updateStatus('正在接收并播放音频流...');
          const chunks = jsonObj.serverContent.audioChunks;
          for (const chunk of chunks) {
            if (chunk.data && chunk.mimeType) {
              this.handleRawPcmAudio(chunk.data, chunk.mimeType);
            }
          }
        }
      } catch (e) {
        console.error('解析 WebSocket 消息失败:', e);
      }
    };

    this.ws.onerror = (err) => {
      this.updateStatus('连接发生错误');
      if (this.onError) this.onError(err);
    };

    this.ws.onclose = () => {
      this.updateStatus('连接已断开');
    };
  }

  public async ensureConnected(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.connect();

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          clearInterval(checkInterval);
          resolve();
        } else if (this.ws && this.ws.readyState === WebSocket.CLOSED) {
          clearInterval(checkInterval);
          reject(new Error('WebSocket 无法建立连接'));
        }
      }, 100);

      // 8秒超时判定
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('WebSocket 连接超时'));
      }, 8000);
    });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  public sendCommand(payload: LyriaPromptConfig | LyriaPlaybackControl | LyriaMusicConfig) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未连接，无法发送指令');
      return;
    }
    this.ws.send(JSON.stringify(payload));
  }

  public pause() {
    this.sendCommand({ playbackControl: 'PAUSE' });
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
      this.updateStatus('已暂停');
    }
  }

  public resume() {
    this.sendCommand({ playbackControl: 'PLAY' });
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      this.updateStatus('正在接收并播放音频流...');
    }
  }

  public stop() {
    this.sendCommand({ playbackControl: 'STOP' });
    if (this.audioContext) {
      this.audioContext.suspend();
      this.nextPlayTime = 0;
      this.updateStatus('已停止');
    }
  }

  public resetContext() {
    this.sendCommand({ playbackControl: 'RESET_CONTEXT' });
    this.stop();
    this.updateStatus('上下文已重置');
  }

  private async handleRawPcmAudio(base64Data: string, mimeType: string) {
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('无法唤醒 AudioContext:', e);
      }
    }

    const rateMatch = mimeType.match(/rate=(\d+)/);
    const channelsMatch = mimeType.match(/channels=(\d+)/);
    const sampleRate = rateMatch ? parseInt(rateMatch[1]!, 10) : 48000;
    const channels = channelsMatch ? parseInt(channelsMatch[1]!, 10) : 2;

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const dataView = new DataView(bytes.buffer);
    const numSamples = len / 2;
    const float32Data = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      const intSample = dataView.getInt16(i * 2, true);
      float32Data[i] = intSample < 0 ? intSample / 32768 : intSample / 32767;
    }

    const frames = numSamples / channels;
    const audioBuffer = this.audioContext.createBuffer(channels, frames, sampleRate);

    for (let channel = 0; channel < channels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      let offset = channel;
      for (let i = 0; i < frames; i++) {
        channelData[i] = float32Data[offset] ?? 0;
        offset += channels;
      }
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime;
    }
    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;
  }

  private updateStatus(status: string) {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }
}
