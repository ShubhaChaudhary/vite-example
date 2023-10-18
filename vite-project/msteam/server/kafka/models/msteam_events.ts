/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'dubber_meeting';

export interface Msteams {
  meeting_event?: Msteams_MeetingEvent | undefined;
  personal_event?: Msteams_PersonalEvent | undefined;
}

export interface Msteams_MeetingEvent {
  event_name: Msteams_MeetingEvent_EventName;
  event_data?: Msteams_MeetingEvent_EventData | undefined;
  slim_event_data?: Msteams_MeetingEvent_SlimEventData | undefined;
  tab_event_data?: Msteams_MeetingEvent_TabEventData | undefined;
}

export enum Msteams_MeetingEvent_EventName {
  ON_INSTALLATION_UPDATE_ADD = 0,
  ON_INSTALLATION_UPDATE_REMOVE = 1,
  ON_MEMBERS_ADDED = 2,
  ON_MEMBERS_REMOVED = 3,
  ON_TEAMS_MEETING_START_EVENT = 4,
  ON_TEAMS_MEETING_END_EVENT = 5,
  ON_TAB_REMOVED = 6,
  UNRECOGNIZED = -1
}

export function msteams_MeetingEvent_EventNameFromJSON(
  object: any
): Msteams_MeetingEvent_EventName {
  switch (object) {
    case 0:
    case 'ON_INSTALLATION_UPDATE_ADD':
      return Msteams_MeetingEvent_EventName.ON_INSTALLATION_UPDATE_ADD;
    case 1:
    case 'ON_INSTALLATION_UPDATE_REMOVE':
      return Msteams_MeetingEvent_EventName.ON_INSTALLATION_UPDATE_REMOVE;
    case 2:
    case 'ON_MEMBERS_ADDED':
      return Msteams_MeetingEvent_EventName.ON_MEMBERS_ADDED;
    case 3:
    case 'ON_MEMBERS_REMOVED':
      return Msteams_MeetingEvent_EventName.ON_MEMBERS_REMOVED;
    case 4:
    case 'ON_TEAMS_MEETING_START_EVENT':
      return Msteams_MeetingEvent_EventName.ON_TEAMS_MEETING_START_EVENT;
    case 5:
    case 'ON_TEAMS_MEETING_END_EVENT':
      return Msteams_MeetingEvent_EventName.ON_TEAMS_MEETING_END_EVENT;
    case 6:
    case 'ON_TAB_REMOVED':
      return Msteams_MeetingEvent_EventName.ON_TAB_REMOVED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return Msteams_MeetingEvent_EventName.UNRECOGNIZED;
  }
}

export function msteams_MeetingEvent_EventNameToJSON(
  object: Msteams_MeetingEvent_EventName
): string {
  switch (object) {
    case Msteams_MeetingEvent_EventName.ON_INSTALLATION_UPDATE_ADD:
      return 'ON_INSTALLATION_UPDATE_ADD';
    case Msteams_MeetingEvent_EventName.ON_INSTALLATION_UPDATE_REMOVE:
      return 'ON_INSTALLATION_UPDATE_REMOVE';
    case Msteams_MeetingEvent_EventName.ON_MEMBERS_ADDED:
      return 'ON_MEMBERS_ADDED';
    case Msteams_MeetingEvent_EventName.ON_MEMBERS_REMOVED:
      return 'ON_MEMBERS_REMOVED';
    case Msteams_MeetingEvent_EventName.ON_TEAMS_MEETING_START_EVENT:
      return 'ON_TEAMS_MEETING_START_EVENT';
    case Msteams_MeetingEvent_EventName.ON_TEAMS_MEETING_END_EVENT:
      return 'ON_TEAMS_MEETING_END_EVENT';
    case Msteams_MeetingEvent_EventName.ON_TAB_REMOVED:
      return 'ON_TAB_REMOVED';
    case Msteams_MeetingEvent_EventName.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

export interface Msteams_MeetingEvent_TabEventData {
  /** meeting id from msteams */
  id: string;
  /** id of the user who initiated event */
  user_id: string;
  /** id of the tenant of the user who initiated event */
  tenant_id: string;
  /** id of the notes meeting */
  instance_id: string;
}

export interface Msteams_MeetingEvent_EventData {
  /** meeting id from msteams */
  id: string;
  conversation: Msteams_MeetingEvent_Conversation | undefined;
  meeting_title?: string | undefined;
  meeting_type: string;
  join_url: string;
  organizer: Msteams_MeetingEvent_User | undefined;
  collaborators: Msteams_MeetingEvent_User[];
  scheduled_start_time: number;
  scheduled_end_time: number;
  /** actual start time */
  start_time?: number | undefined;
  /** actual end time */
  end_time?: number | undefined;
}

export interface Msteams_MeetingEvent_SlimEventData {
  /** meeting id from msteams */
  id: string;
  conversation: Msteams_MeetingEvent_Conversation | undefined;
  meeting_title?: string | undefined;
}

export interface Msteams_MeetingEvent_User {
  /** user id from msteams unique to the meeting */
  id: string;
  /** primary user id from msteams (aadObjectId) */
  external_id: string;
  /** full name */
  name?: string | undefined;
  given_name?: string | undefined;
  surname?: string | undefined;
  email: string;
  tenant_id: string;
}

export interface Msteams_MeetingEvent_Conversation {
  /** conversation id from msteams */
  id: string;
  /**
   * service endpoint where operations concerning the referenced
   * conversation may be performed
   */
  service_url: string;
}

export interface Msteams_PersonalEvent {
  event_name: Msteams_PersonalEvent_EventName;
  event_data: Msteams_PersonalEvent_EventData | undefined;
}

export enum Msteams_PersonalEvent_EventName {
  ON_MEMBERS_ADDED = 0,
  ON_INSTALLATION_UPDATE_REMOVE = 1,
  UNRECOGNIZED = -1
}

export function msteams_PersonalEvent_EventNameFromJSON(
  object: any
): Msteams_PersonalEvent_EventName {
  switch (object) {
    case 0:
    case 'ON_MEMBERS_ADDED':
      return Msteams_PersonalEvent_EventName.ON_MEMBERS_ADDED;
    case 1:
    case 'ON_INSTALLATION_UPDATE_REMOVE':
      return Msteams_PersonalEvent_EventName.ON_INSTALLATION_UPDATE_REMOVE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return Msteams_PersonalEvent_EventName.UNRECOGNIZED;
  }
}

export function msteams_PersonalEvent_EventNameToJSON(
  object: Msteams_PersonalEvent_EventName
): string {
  switch (object) {
    case Msteams_PersonalEvent_EventName.ON_MEMBERS_ADDED:
      return 'ON_MEMBERS_ADDED';
    case Msteams_PersonalEvent_EventName.ON_INSTALLATION_UPDATE_REMOVE:
      return 'ON_INSTALLATION_UPDATE_REMOVE';
    case Msteams_PersonalEvent_EventName.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

export interface Msteams_PersonalEvent_EventData {
  /** aad user object id */
  external_id: string;
  /**
   * unique identifier generated upon bot installation,
   * this id is unique to the bot user pair
   */
  user_id: string;
  tenant_id: string;
  service_url: string;
}

function createBaseMsteams(): Msteams {
  return { meeting_event: undefined, personal_event: undefined };
}

export const Msteams = {
  encode(
    message: Msteams,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.meeting_event !== undefined) {
      Msteams_MeetingEvent.encode(
        message.meeting_event,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.personal_event !== undefined) {
      Msteams_PersonalEvent.encode(
        message.personal_event,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Msteams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsteams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.meeting_event = Msteams_MeetingEvent.decode(
            reader,
            reader.uint32()
          );
          break;
        case 2:
          message.personal_event = Msteams_PersonalEvent.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Msteams {
    return {
      meeting_event: isSet(object.meeting_event)
        ? Msteams_MeetingEvent.fromJSON(object.meeting_event)
        : undefined,
      personal_event: isSet(object.personal_event)
        ? Msteams_PersonalEvent.fromJSON(object.personal_event)
        : undefined
    };
  },

  toJSON(message: Msteams): unknown {
    const obj: any = {};
    message.meeting_event !== undefined &&
      (obj.meeting_event = message.meeting_event
        ? Msteams_MeetingEvent.toJSON(message.meeting_event)
        : undefined);
    message.personal_event !== undefined &&
      (obj.personal_event = message.personal_event
        ? Msteams_PersonalEvent.toJSON(message.personal_event)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Msteams>, I>>(base?: I): Msteams {
    return Msteams.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Msteams>, I>>(object: I): Msteams {
    const message = createBaseMsteams();
    message.meeting_event =
      object.meeting_event !== undefined && object.meeting_event !== null
        ? Msteams_MeetingEvent.fromPartial(object.meeting_event)
        : undefined;
    message.personal_event =
      object.personal_event !== undefined && object.personal_event !== null
        ? Msteams_PersonalEvent.fromPartial(object.personal_event)
        : undefined;
    return message;
  }
};

function createBaseMsteams_MeetingEvent(): Msteams_MeetingEvent {
  return {
    event_name: 0,
    event_data: undefined,
    slim_event_data: undefined,
    tab_event_data: undefined
  };
}

export const Msteams_MeetingEvent = {
  encode(
    message: Msteams_MeetingEvent,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.event_name !== 0) {
      writer.uint32(8).int32(message.event_name);
    }
    if (message.event_data !== undefined) {
      Msteams_MeetingEvent_EventData.encode(
        message.event_data,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.slim_event_data !== undefined) {
      Msteams_MeetingEvent_SlimEventData.encode(
        message.slim_event_data,
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.tab_event_data !== undefined) {
      Msteams_MeetingEvent_TabEventData.encode(
        message.tab_event_data,
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): Msteams_MeetingEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsteams_MeetingEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.event_name = reader.int32() as any;
          break;
        case 2:
          message.event_data = Msteams_MeetingEvent_EventData.decode(
            reader,
            reader.uint32()
          );
          break;
        case 3:
          message.slim_event_data = Msteams_MeetingEvent_SlimEventData.decode(
            reader,
            reader.uint32()
          );
          break;
        case 4:
          message.tab_event_data = Msteams_MeetingEvent_TabEventData.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Msteams_MeetingEvent {
    return {
      event_name: isSet(object.event_name)
        ? msteams_MeetingEvent_EventNameFromJSON(object.event_name)
        : 0,
      event_data: isSet(object.event_data)
        ? Msteams_MeetingEvent_EventData.fromJSON(object.event_data)
        : undefined,
      slim_event_data: isSet(object.slim_event_data)
        ? Msteams_MeetingEvent_SlimEventData.fromJSON(object.slim_event_data)
        : undefined,
      tab_event_data: isSet(object.tab_event_data)
        ? Msteams_MeetingEvent_TabEventData.fromJSON(object.tab_event_data)
        : undefined
    };
  },

  toJSON(message: Msteams_MeetingEvent): unknown {
    const obj: any = {};
    message.event_name !== undefined &&
      (obj.event_name = msteams_MeetingEvent_EventNameToJSON(
        message.event_name
      ));
    message.event_data !== undefined &&
      (obj.event_data = message.event_data
        ? Msteams_MeetingEvent_EventData.toJSON(message.event_data)
        : undefined);
    message.slim_event_data !== undefined &&
      (obj.slim_event_data = message.slim_event_data
        ? Msteams_MeetingEvent_SlimEventData.toJSON(message.slim_event_data)
        : undefined);
    message.tab_event_data !== undefined &&
      (obj.tab_event_data = message.tab_event_data
        ? Msteams_MeetingEvent_TabEventData.toJSON(message.tab_event_data)
        : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Msteams_MeetingEvent>, I>>(
    base?: I
  ): Msteams_MeetingEvent {
    return Msteams_MeetingEvent.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Msteams_MeetingEvent>, I>>(
    object: I
  ): Msteams_MeetingEvent {
    const message = createBaseMsteams_MeetingEvent();
    message.event_name = object.event_name ?? 0;
    message.event_data =
      object.event_data !== undefined && object.event_data !== null
        ? Msteams_MeetingEvent_EventData.fromPartial(object.event_data)
        : undefined;
    message.slim_event_data =
      object.slim_event_data !== undefined && object.slim_event_data !== null
        ? Msteams_MeetingEvent_SlimEventData.fromPartial(object.slim_event_data)
        : undefined;
    message.tab_event_data =
      object.tab_event_data !== undefined && object.tab_event_data !== null
        ? Msteams_MeetingEvent_TabEventData.fromPartial(object.tab_event_data)
        : undefined;
    return message;
  }
};

function createBaseMsteams_MeetingEvent_TabEventData(): Msteams_MeetingEvent_TabEventData {
  return { id: '', user_id: '', tenant_id: '', instance_id: '' };
}

export const Msteams_MeetingEvent_TabEventData = {
  encode(
    message: Msteams_MeetingEvent_TabEventData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    if (message.user_id !== '') {
      writer.uint32(18).string(message.user_id);
    }
    if (message.tenant_id !== '') {
      writer.uint32(26).string(message.tenant_id);
    }
    if (message.instance_id !== '') {
      writer.uint32(34).string(message.instance_id);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): Msteams_MeetingEvent_TabEventData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsteams_MeetingEvent_TabEventData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.user_id = reader.string();
          break;
        case 3:
          message.tenant_id = reader.string();
          break;
        case 4:
          message.instance_id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Msteams_MeetingEvent_TabEventData {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      user_id: isSet(object.user_id) ? String(object.user_id) : '',
      tenant_id: isSet(object.tenant_id) ? String(object.tenant_id) : '',
      instance_id: isSet(object.instance_id) ? String(object.instance_id) : ''
    };
  },

  toJSON(message: Msteams_MeetingEvent_TabEventData): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.user_id !== undefined && (obj.user_id = message.user_id);
    message.tenant_id !== undefined && (obj.tenant_id = message.tenant_id);
    message.instance_id !== undefined &&
      (obj.instance_id = message.instance_id);
    return obj;
  },

  create<I extends Exact<DeepPartial<Msteams_MeetingEvent_TabEventData>, I>>(
    base?: I
  ): Msteams_MeetingEvent_TabEventData {
    return Msteams_MeetingEvent_TabEventData.fromPartial(base ?? {});
  },

  fromPartial<
    I extends Exact<DeepPartial<Msteams_MeetingEvent_TabEventData>, I>
  >(object: I): Msteams_MeetingEvent_TabEventData {
    const message = createBaseMsteams_MeetingEvent_TabEventData();
    message.id = object.id ?? '';
    message.user_id = object.user_id ?? '';
    message.tenant_id = object.tenant_id ?? '';
    message.instance_id = object.instance_id ?? '';
    return message;
  }
};

function createBaseMsteams_MeetingEvent_EventData(): Msteams_MeetingEvent_EventData {
  return {
    id: '',
    conversation: undefined,
    meeting_title: undefined,
    meeting_type: '',
    join_url: '',
    organizer: undefined,
    collaborators: [],
    scheduled_start_time: 0,
    scheduled_end_time: 0,
    start_time: undefined,
    end_time: undefined
  };
}

export const Msteams_MeetingEvent_EventData = {
  encode(
    message: Msteams_MeetingEvent_EventData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    if (message.conversation !== undefined) {
      Msteams_MeetingEvent_Conversation.encode(
        message.conversation,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.meeting_title !== undefined) {
      writer.uint32(26).string(message.meeting_title);
    }
    if (message.meeting_type !== '') {
      writer.uint32(34).string(message.meeting_type);
    }
    if (message.join_url !== '') {
      writer.uint32(42).string(message.join_url);
    }
    if (message.organizer !== undefined) {
      Msteams_MeetingEvent_User.encode(
        message.organizer,
        writer.uint32(50).fork()
      ).ldelim();
    }
    for (const v of message.collaborators) {
      Msteams_MeetingEvent_User.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (message.scheduled_start_time !== 0) {
      writer.uint32(64).int64(message.scheduled_start_time);
    }
    if (message.scheduled_end_time !== 0) {
      writer.uint32(72).int64(message.scheduled_end_time);
    }
    if (message.start_time !== undefined) {
      writer.uint32(80).int64(message.start_time);
    }
    if (message.end_time !== undefined) {
      writer.uint32(88).int64(message.end_time);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): Msteams_MeetingEvent_EventData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsteams_MeetingEvent_EventData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.conversation = Msteams_MeetingEvent_Conversation.decode(
            reader,
            reader.uint32()
          );
          break;
        case 3:
          message.meeting_title = reader.string();
          break;
        case 4:
          message.meeting_type = reader.string();
          break;
        case 5:
          message.join_url = reader.string();
          break;
        case 6:
          message.organizer = Msteams_MeetingEvent_User.decode(
            reader,
            reader.uint32()
          );
          break;
        case 7:
          message.collaborators.push(
            Msteams_MeetingEvent_User.decode(reader, reader.uint32())
          );
          break;
        case 8:
          message.scheduled_start_time = longToNumber(reader.int64() as Long);
          break;
        case 9:
          message.scheduled_end_time = longToNumber(reader.int64() as Long);
          break;
        case 10:
          message.start_time = longToNumber(reader.int64() as Long);
          break;
        case 11:
          message.end_time = longToNumber(reader.int64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Msteams_MeetingEvent_EventData {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      conversation: isSet(object.conversation)
        ? Msteams_MeetingEvent_Conversation.fromJSON(object.conversation)
        : undefined,
      meeting_title: isSet(object.meeting_title)
        ? String(object.meeting_title)
        : undefined,
      meeting_type: isSet(object.meeting_type)
        ? String(object.meeting_type)
        : '',
      join_url: isSet(object.join_url) ? String(object.join_url) : '',
      organizer: isSet(object.organizer)
        ? Msteams_MeetingEvent_User.fromJSON(object.organizer)
        : undefined,
      collaborators: Array.isArray(object?.collaborators)
        ? object.collaborators.map((e: any) =>
            Msteams_MeetingEvent_User.fromJSON(e)
          )
        : [],
      scheduled_start_time: isSet(object.scheduled_start_time)
        ? Number(object.scheduled_start_time)
        : 0,
      scheduled_end_time: isSet(object.scheduled_end_time)
        ? Number(object.scheduled_end_time)
        : 0,
      start_time: isSet(object.start_time)
        ? Number(object.start_time)
        : undefined,
      end_time: isSet(object.end_time) ? Number(object.end_time) : undefined
    };
  },

  toJSON(message: Msteams_MeetingEvent_EventData): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.conversation !== undefined &&
      (obj.conversation = message.conversation
        ? Msteams_MeetingEvent_Conversation.toJSON(message.conversation)
        : undefined);
    message.meeting_title !== undefined &&
      (obj.meeting_title = message.meeting_title);
    message.meeting_type !== undefined &&
      (obj.meeting_type = message.meeting_type);
    message.join_url !== undefined && (obj.join_url = message.join_url);
    message.organizer !== undefined &&
      (obj.organizer = message.organizer
        ? Msteams_MeetingEvent_User.toJSON(message.organizer)
        : undefined);
    if (message.collaborators) {
      obj.collaborators = message.collaborators.map((e) =>
        e ? Msteams_MeetingEvent_User.toJSON(e) : undefined
      );
    } else {
      obj.collaborators = [];
    }
    message.scheduled_start_time !== undefined &&
      (obj.scheduled_start_time = Math.round(message.scheduled_start_time));
    message.scheduled_end_time !== undefined &&
      (obj.scheduled_end_time = Math.round(message.scheduled_end_time));
    message.start_time !== undefined &&
      (obj.start_time = Math.round(message.start_time));
    message.end_time !== undefined &&
      (obj.end_time = Math.round(message.end_time));
    return obj;
  },

  create<I extends Exact<DeepPartial<Msteams_MeetingEvent_EventData>, I>>(
    base?: I
  ): Msteams_MeetingEvent_EventData {
    return Msteams_MeetingEvent_EventData.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Msteams_MeetingEvent_EventData>, I>>(
    object: I
  ): Msteams_MeetingEvent_EventData {
    const message = createBaseMsteams_MeetingEvent_EventData();
    message.id = object.id ?? '';
    message.conversation =
      object.conversation !== undefined && object.conversation !== null
        ? Msteams_MeetingEvent_Conversation.fromPartial(object.conversation)
        : undefined;
    message.meeting_title = object.meeting_title ?? undefined;
    message.meeting_type = object.meeting_type ?? '';
    message.join_url = object.join_url ?? '';
    message.organizer =
      object.organizer !== undefined && object.organizer !== null
        ? Msteams_MeetingEvent_User.fromPartial(object.organizer)
        : undefined;
    message.collaborators =
      object.collaborators?.map((e) =>
        Msteams_MeetingEvent_User.fromPartial(e)
      ) || [];
    message.scheduled_start_time = object.scheduled_start_time ?? 0;
    message.scheduled_end_time = object.scheduled_end_time ?? 0;
    message.start_time = object.start_time ?? undefined;
    message.end_time = object.end_time ?? undefined;
    return message;
  }
};

function createBaseMsteams_MeetingEvent_SlimEventData(): Msteams_MeetingEvent_SlimEventData {
  return { id: '', conversation: undefined, meeting_title: undefined };
}

export const Msteams_MeetingEvent_SlimEventData = {
  encode(
    message: Msteams_MeetingEvent_SlimEventData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    if (message.conversation !== undefined) {
      Msteams_MeetingEvent_Conversation.encode(
        message.conversation,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.meeting_title !== undefined) {
      writer.uint32(26).string(message.meeting_title);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): Msteams_MeetingEvent_SlimEventData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsteams_MeetingEvent_SlimEventData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.conversation = Msteams_MeetingEvent_Conversation.decode(
            reader,
            reader.uint32()
          );
          break;
        case 3:
          message.meeting_title = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Msteams_PersonalEvent_EventData {
    return {
      external_id: isSet(object.external_id) ? String(object.external_id) : '',
      user_id: isSet(object.user_id) ? String(object.user_id) : '',
      tenant_id: isSet(object.tenant_id) ? String(object.tenant_id) : '',
      service_url: isSet(object.service_url) ? String(object.service_url) : ''
    };
  },

  toJSON(message: Msteams_PersonalEvent_EventData): unknown {
    const obj: any = {};
    message.external_id !== undefined &&
      (obj.external_id = message.external_id);
    message.user_id !== undefined && (obj.user_id = message.user_id);
    message.tenant_id !== undefined && (obj.tenant_id = message.tenant_id);
    message.service_url !== undefined &&
      (obj.service_url = message.service_url);
    return obj;
  },

  create<I extends Exact<DeepPartial<Msteams_PersonalEvent_EventData>, I>>(
    base?: I
  ): Msteams_PersonalEvent_EventData {
    return Msteams_PersonalEvent_EventData.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Msteams_PersonalEvent_EventData>, I>>(
    object: I
  ): Msteams_PersonalEvent_EventData {
    const message = createBaseMsteams_PersonalEvent_EventData();
    message.external_id = object.external_id ?? '';
    message.user_id = object.user_id ?? '';
    message.tenant_id = object.tenant_id ?? '';
    message.service_url = object.service_url ?? '';
    return message;
  }
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  throw 'Unable to locate global object';
})();

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

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error(
      'Value is larger than Number.MAX_SAFE_INTEGER'
    );
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
