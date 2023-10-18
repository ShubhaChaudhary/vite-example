import React, { useEffect, useState } from 'react';
import kebabCase from 'lodash/kebabCase';
import tw from 'twin.macro';

export interface AvatarProps {
  contentEditable?: boolean;
  type?: 'base' | 'multiplayer';
  multiplayerNumber?: number;
  ghost?: boolean;
  className?: string;
  rounded?: 'full' | 'md' | false;
  size?: 'xs' | 'sm' | 'md';
  status?: 'success' | 'warning' | 'alert';
  statusIcon?: React.ReactNode;
  name?: string;
  src?: string;
  testId?: string;
}

const formatInitials = (name: string) => {
  // Strip out email domains (most names will usually be display names, but email is a fallback).
  const at = name.indexOf('@');
  const cleanName = at === -1 ? name : name.slice(0, at);

  return kebabCase(cleanName)
    .split('-')
    .filter((part) => !!part.trim())
    .map((part) => part[0].toUpperCase())
    .join('');
};

const Avatar: React.FC<AvatarProps> = ({
  type = 'base',
  rounded = 'full',
  ghost,
  className,
  contentEditable,
  name,
  src,
  size,
  status,
  statusIcon,
  multiplayerNumber,
  testId
}) => {
  const [fallback, setFallback] = useState(false);
  const mode =
    !fallback && src
      ? 'image'
      : (!src || fallback) && name && name.trim()
      ? 'text'
      : 'fallback-image';

  useEffect(() => {
    if (!src) {
      return;
    }

    const img = new Image();

    img.src = src;
    img.onload = () => setFallback(false);
    img.onerror = () => setFallback(true);
  }, [src]);

  return (
    <span
      className={className}
      contentEditable={contentEditable}
      data-testid={testId}
      css={[
        rounded === 'full' && tw`rounded-full`,
        rounded === 'md' && tw`rounded-md`,
        size === 'xs' && tw`w-5 h-5 text-[0.55rem]`,
        size === 'sm' && tw`w-6 h-6 text-[0.6rem]`,
        size === 'md' && tw`w-8 h-8 text-sm`,
        tw`relative bg-white inline-flex`
      ]}
    >
      <span
        contentEditable={contentEditable}
        css={[
          tw`inline-flex w-full h-full items-center justify-center rounded-full`,
          type === 'base' && tw`bg-base-3`,
          type === 'multiplayer' && tw`border-2`,
          type === 'multiplayer' &&
            multiplayerNumber === 1 &&
            tw`bg-multiplayer-1 border-multiplayer-1`,
          type === 'multiplayer' &&
            multiplayerNumber === 2 &&
            tw`bg-multiplayer-2 border-multiplayer-2`,
          type === 'multiplayer' &&
            multiplayerNumber === 3 &&
            tw`bg-multiplayer-3 border-multiplayer-3`,
          type === 'multiplayer' &&
            multiplayerNumber === 4 &&
            tw`bg-multiplayer-4 border-multiplayer-4`,
          type === 'multiplayer' &&
            multiplayerNumber === 5 &&
            tw`bg-multiplayer-5 border-multiplayer-5`,
          type === 'multiplayer' &&
            multiplayerNumber === 6 &&
            tw`bg-multiplayer-6 border-multiplayer-6`,
          type === 'multiplayer' &&
            multiplayerNumber === 7 &&
            tw`bg-multiplayer-7 border-multiplayer-7`,
          type === 'multiplayer' &&
            multiplayerNumber === 8 &&
            tw`bg-multiplayer-8 border-multiplayer-8`,
          type === 'multiplayer' &&
            multiplayerNumber === 9 &&
            tw`bg-multiplayer-9 border-multiplayer-9`,
          type === 'multiplayer' &&
            multiplayerNumber === 10 &&
            tw`bg-multiplayer-10 border-multiplayer-10`,
          ghost && tw`opacity-25`
        ]}
      >
        {mode === 'fallback-image' && (
          <svg
            css={[
              rounded === 'full' && tw`rounded-full`,
              rounded === 'md' && tw`rounded-md`,
              tw`h-full w-full text-primary-900`
            ]}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}

        {mode === 'text' && (
          <span css={tw`font-bold leading-none text-primary-900 select-none`}>
            {formatInitials(name!).slice(0, 2)}
          </span>
        )}

        {mode === 'image' && (
          <img
            css={[
              rounded === 'full' && tw`rounded-full`,
              rounded === 'md' && tw`rounded-md`,
              tw`h-full w-full`
            ]}
            src={src}
            alt={''}
          />
        )}
      </span>

      {status && (
        <span
          css={[
            status === 'alert' && tw`bg-alert-6`,
            status === 'warning' && tw`bg-warning-5`,
            status === 'success' && tw`bg-success-5`,
            tw`absolute inline-flex justify-center items-center w-2/5 h-2/5 p-0.5 -bottom-0.5 -right-0.5 ring-1 ring-white text-white rounded-full`
          ]}
        >
          {statusIcon}
        </span>
      )}
    </span>
  );
};

export default Avatar;