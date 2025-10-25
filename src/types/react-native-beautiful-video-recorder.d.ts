declare module 'react-native-beautiful-video-recorder' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface VideoRecorderProps {
    ref?: any;
    cameraOptions?: {
      cameraFacing?: 'front' | 'back';
    };
    videoOptions?: {
      maxDuration?: number;
      quality?: 'low' | 'medium' | 'high';
    };
    onRecordingComplete?: (video: { uri: string }) => void;
    onError?: (error: any) => void;
    style?: ViewStyle;
  }

  export default class VideoRecorder extends Component<VideoRecorderProps> {
    startRecording(): void;
    stopRecording(): void;
  }
}
