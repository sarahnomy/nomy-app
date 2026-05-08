import {
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

type FontWeight = TextStyle['fontWeight'];

const normalFonts = {
  light: 'DMSans_300Light',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  extraBold: 'DMSans_800ExtraBold',
  black: 'DMSans_900Black',
};

const italicFonts = {
  light: 'DMSans_300Light_Italic',
  regular: 'DMSans_400Regular_Italic',
  medium: 'DMSans_500Medium_Italic',
  semibold: 'DMSans_600SemiBold_Italic',
  bold: 'DMSans_700Bold_Italic',
  extraBold: 'DMSans_800ExtraBold_Italic',
  black: 'DMSans_900Black_Italic',
};

function resolveWeight(weight: FontWeight) {
  if (weight === '900') return 'black';
  if (weight === '800' || weight === 'heavy') return 'extraBold';
  if (weight === '700' || weight === 'bold') return 'bold';
  if (weight === '600' || weight === 'semibold') return 'semibold';
  if (weight === '500' || weight === 'medium') return 'medium';
  if (weight === '300' || weight === '200' || weight === '100' || weight === 'ultralight' || weight === 'thin' || weight === 'light') {
    return 'light';
  }

  return 'regular';
}

function fontForStyle(style: TextStyle | undefined) {
  const fonts = style?.fontStyle === 'italic' ? italicFonts : normalFonts;
  return fonts[resolveWeight(style?.fontWeight)];
}

function withDmSans(style: TextProps['style']) {
  const flattened = StyleSheet.flatten(style);

  return [
    style,
    {
      fontFamily: fontForStyle(flattened),
      fontWeight: '400' as const,
      fontStyle: 'normal' as const,
    },
  ];
}

export function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} style={withDmSans(style)} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  return <NativeTextInput {...props} style={withDmSans(style)} />;
}

export type { TextInputProps, TextProps };
