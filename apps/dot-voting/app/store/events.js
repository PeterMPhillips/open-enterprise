import { castVote, executeVote, startVote } from './votes'
import { onEntryAdded, onEntryRemoved } from './entry'
import { hasLoadedVoteSettings, loadVoteSettings } from '../utils/vote-settings'
import { handleAction } from './'

export const handleEvent = async (state, event, settings) => {
  const {
    event: eventName,
    // TODO: implement eventAddress:
    // address: eventAddress,
    returnValues
  } = event
  const { addressBook } = settings
  const { entries } = state
  let nextEntries
  let nextState = {
    ...state,
    ...(!hasLoadedVoteSettings(state) ? await loadVoteSettings() : {}),
  }
  switch (eventName) {
  case 'CastVote':
    nextState = await castVote(nextState, returnValues)
    break
  case 'ExecutionScript':
    break
  case 'ExecuteVote':
    nextState = await executeVote(nextState, returnValues)
    handleAction(nextState, event)
    break
  case 'StartVote':
    nextState = await startVote(nextState, returnValues)
    handleAction(nextState, event)
    break
  case 'EntryAdded':
    nextEntries = await onEntryAdded({ entries, addressBook }, returnValues)
    nextState.entries = nextEntries
    break
  case 'EntryRemoved':
    nextEntries = await onEntryRemoved({ entries, addressBook }, returnValues)
    nextState.entries = nextEntries
    break
  default:
    break
  }
  return nextState
}
