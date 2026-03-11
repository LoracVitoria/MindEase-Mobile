import React, { useMemo, useRef } from 'react';
import { Platform, TextInput, type TextInputProps } from 'react-native';

type Props = Omit<TextInputProps, 'onChangeText'> & {
  value: string;
  onChangeText: (text: string) => void;
};

/**
 * Workaround for accent/dead-key composition issues on web with controlled TextInput.
 * On web, we avoid syncing value during IME composition and commit on composition end.
 */
export function SafeTextInput({ onChangeText, ...props }: Props) {
  const isComposingRef = useRef(false);
  const pendingTextRef = useRef<string | null>(null);

  const compositionProps = useMemo(() => {
    if (Platform.OS !== 'web') return {};

    return {
      onCompositionStart: () => {
        isComposingRef.current = true;
      },
      onCompositionEnd: () => {
        isComposingRef.current = false;
        if (pendingTextRef.current !== null) {
          onChangeText(pendingTextRef.current);
          pendingTextRef.current = null;
        }
      },
    } as unknown as Partial<TextInputProps>;
  }, [onChangeText]);

  return (
    <TextInput
      {...props}
      {...compositionProps}
      onChangeText={(text) => {
        if (Platform.OS === 'web' && isComposingRef.current) {
          pendingTextRef.current = text;
          return;
        }
        onChangeText(text);
      }}
    />
  );
}
