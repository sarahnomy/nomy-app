import {
  Platform,
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
} from 'react-native';

export function Text(props: TextProps) {
  return <NativeText {...props} style={[defaultTextStyle, props.style]} />;
}

export function TextInput(props: TextInputProps) {
  return <NativeTextInput {...props} style={[defaultTextStyle, defaultInputStyle, props.style]} />;
}

export type { TextInputProps, TextProps };

const defaultTextStyle = {
  fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: undefined }),
  fontWeight: '600' as const,
  letterSpacing: -0.1,
  includeFontPadding: false,
};

const defaultInputStyle = {
  fontWeight: '500' as const,
};
