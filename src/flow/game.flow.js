// @flow
import type { ObjectId } from 'mongoose'

export type Game = {
  +_id: ObjectId,
  +gameId: string,
  +title: string,
  +description: string,
  +location: string,
  +startTime: Date,
  +mins: number,
  +tags: $ReadOnlyArray<string>,
  +genres: $ReadOnlyArray<string>,
  +styles: $ReadOnlyArray<string>,
  +language: string,
  +endTime: Date,
  +people: string,
  +minAttendance: number,
  +maxAttendance: number,
  +gameSystem: string,
  +noLanguage: boolean,
  +englishOk: boolean,
  +childrenFriendly: boolean,
  +ageRestricted: boolean,
  +beginnerFriendly: boolean,
  +intendedForExperiencedParticipants: boolean,
}

export type KompassiGame = {
  +title: string,
  +description: string,
  +category_title: string,
  +formatted_hosts: string,
  +room_name: string,
  +length: number,
  +start_time: string,
  +end_time: string,
  +language: string,
  +rpg_system: string,
  +no_language: boolean,
  +english_ok: boolean,
  +children_friendly: boolean,
  +age_restricted: boolean,
  +beginner_friendly: boolean,
  +intended_for_experienced_participants: boolean,
  +min_players: number,
  +max_players: number,
  +identifier: string,
  +tags: $ReadOnlyArray<string>,
  +genres: $ReadOnlyArray<string>,
  +styles: $ReadOnlyArray<string>,
}

export type GameWithPlayerCount = {
  +game: Game,
  +players: number,
}
