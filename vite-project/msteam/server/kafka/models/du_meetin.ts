/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { Msteams } from './msteams_event';

export const protobufPackage = 'dubber_meeting';

export interface MeetingEvent {
  msteams?: Msteams | undefined;
}

function createBaseMeetingEvent(): MeetingEvent {
  return { msteams: undefined };
}

export const MeetingEvent = {
  encode(
    message: MeetingEvent,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.msteams !== undefined) {
      Msteams.encode(message.msteams, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MeetingEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMeetingEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.msteams = Msteams.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MeetingEvent {
    return {
      msteams: isSet(object.msteams)
        ? Msteams.fromJSON(object.msteams)
        : undefined
    };
  },

  toJSON(message: MeetingEvent): unknown {
    const obj: any = {};
    message.msteams !== undefined &&
      (obj.msteams = message.msteams
        ? Msteams.toJSON(message.msteams)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<MeetingEvent>, I>>(
    base?: I
  ): MeetingEvent {
    return MeetingEvent.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MeetingEvent>, I>>(
    object: I
  ): MeetingEvent {
    const message = createBaseMeetingEvent();
    message.msteams =
      object.msteams !== undefined && object.msteams !== null
        ? Msteams.fromPartial(object.msteams)
        : undefined;
    return message;
  }
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
      [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
    };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}