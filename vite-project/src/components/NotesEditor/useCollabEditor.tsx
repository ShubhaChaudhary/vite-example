import { useEffect, useMemo, useState } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { createEditor, Editor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { SyncElement, withCursor, withYjs } from 'slate-yjs';
import { WebsocketProvider } from 'y-websocket';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';
import { MeetingAwareness } from '../../models/meeting';
import { currentUserOptionalState } from '../../state/currentUser';
import {
  MeetingCursor,
  meetingIdState,
  meetingNotesHasContentState,
  meetingPlayersState
} from '../../state/meetings';
import { handleError } from '../../utils/errors';
import withNotesEditor, { CursorsUpdateEvent } from './withNotesEditor';
import { useNoteHelpers } from '../../state/notes/helpers';
import { isEqual } from 'lodash';
import useMemoizedDecorate from './useMemoizedDecorate';
import regionData from '../../common/api/regionData';

interface CollabEditorProps {
  token: string | false;
  cursor: MeetingCursor;
  initialValue: Node[];
  initialState: string;
  hideBlockMenu?: boolean;
  hideAwareness?: boolean;
}

const WEBSOCKET_ENDPOINT = regionData.COLLABORATE_URL || 'ws://localhost:1234';

const useCollabEditor = ({
  token,
  cursor,
  initialValue,
  initialState,
  hideAwareness,
  hideBlockMenu
}: CollabEditorProps) => {
  const noteHelpers = useNoteHelpers();
  const id = useRecoilValue(meetingIdState(cursor));
  const currentUser = useRecoilValue(currentUserOptionalState);
  const setHasContent = useSetRecoilState(meetingNotesHasContentState(cursor));
  const room = `${id}/notes`;
  const [online, setOnline] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const [sharedType, provider] = useMemo(() => {
    const doc = new Y.Doc();
    const sharedType = doc.getArray<SyncElement>('content');

    // Ignore but log errors where the base 64 decode fails.
    try {
      const decodedString = atob(initialState);

      if (decodedString) {
        Y.applyUpdate(
          doc,
          Uint8Array.from(decodedString, (c) => c.charCodeAt(0))
        );
      }
    } catch (err: any) {
      handleError(err);
    }

    if (!token) {
      return [sharedType, undefined];
    }

    const provider = new WebsocketProvider(WEBSOCKET_ENDPOINT, room, doc, {
      connect: false,
      params: { token }
    });

    return [sharedType, provider];
  }, []);

  const editor = useMemo(() => {
    const editor = withCursor(
      withYjs(
        withNotesEditor(withReact(withHistory(createEditor())), {
          cursor,
          hideAwareness,
          hideBlockMenu
        }),
        sharedType
      ),
      provider?.awareness || new awarenessProtocol.Awareness(new Y.Doc())
    );

    return editor;
  }, [sharedType, provider]);

  const { cursors, decorate } = useMemoizedDecorate(editor);

  // Hack to force the initial value to be normalized by Slate
  // and to ensure the editor is always in a valid state.
  const normalizedInitialValue = useMemo(() => {
    editor.children = [...initialValue];
    Editor.normalize(editor, { force: true });

    return editor.children;
  }, []);

  const [value, setValue] = useState<Node[]>(normalizedInitialValue);

  // Check that nodes have actual content
  useEffect(() => {
    const content = value.map((node) => Node.string(node)).join('');

    setHasContent(content !== '');
  }, [value]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    let lastStatus: string | undefined;
    const onStatus = ({
      status
    }: {
      status: 'connecting' | 'connected' | 'disconnected';
    }) => {
      setConnecting(status === 'connecting');
      setOnline(status === 'connected');

      if (lastStatus === 'connecting' && status === 'connecting') {
        setConnectionAttempts((attempts) => attempts + 1);
      } else {
        setConnectionAttempts(1);
      }

      lastStatus = status;
    };

    // Ensure connection when the tab becomes visible again.
    const onVisibilityChange = () => {
      if (document.hidden) {
        return;
      }

      setConnectionAttempts(1);
      provider.connect();
    };

    // Ensure connection when the network comes back online.
    const onOnline = () => {
      setConnectionAttempts(1);
      provider.connect();
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);

    provider.on('status', onStatus);
    provider.connect();

    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);

      provider.off('status', onStatus);
      provider.disconnect();
    };
  }, [provider]);

  // Match awareness state up to meeting players.
  const setProviderAwareness = useRecoilCallback(
    ({ snapshot }) =>
      async (email: string, name: string) => {
        if (!provider) {
          return;
        }

        const players = await snapshot.getPromise(meetingPlayersState(cursor));
        const player = players.find(
          ({ email: otherEmail }) => otherEmail === email
        );

        provider.awareness.setLocalState({
          name,
          email,
          avatarUrl: player?.avatarUrl,
          playerNumber: player?.playerNumber || 1
        } as MeetingAwareness);
      },
    [provider, cursor]
  );

  useEffect(() => {
    if (!currentUser || !provider) {
      return;
    }

    setProviderAwareness(
      currentUser.email,
      currentUser.display_name || currentUser.email
    );
  }, [provider, currentUser?.display_name, currentUser?.email]);

  useEffect(() => {
    if (!provider?.awareness) {
      return;
    }

    let lastAwareness: { name: string; email: string }[] | undefined;
    const onChange = () => {
      const newAwareness = Array.from(
        provider.awareness.getStates().values()
      ).map(({ name, email }) => ({ name, email })) as {
        name: string;
        email: string;
      }[];

      if (lastAwareness && isEqual(newAwareness, lastAwareness)) {
        return;
      }

      lastAwareness = newAwareness;
      noteHelpers.updateAwareness(cursor, newAwareness);
    };

    provider.awareness.on('change', onChange);

    return () => {
      provider.awareness.off('change', onChange);
    };
  }, [provider]);

  useEffect(() => {
    editor.cursors.emit('update', {
      cursors
    } as CursorsUpdateEvent);
  }, [cursors]);

  return {
    editor,
    decorate,
    sharedType,
    provider,
    online,
    connecting,
    connectionAttempts,
    value,
    setValue
  };
};

export default useCollabEditor;