import {
  REQUESTING_GITHUB_TOKEN,
  REQUESTED_GITHUB_TOKEN_SUCCESS,
  REQUESTED_GITHUB_TOKEN_FAILURE,
  REQUESTED_GITHUB_DISCONNECT,
  REPO_ADDED,
  REPO_REMOVED,
  BOUNTY_ADDED,
  ASSIGNMENT_REQUESTED,
  ASSIGNMENT_APPROVED,
  SUBMISSION_REJECTED,
  WORK_SUBMITTED,
  SUBMISSION_ACCEPTED,
  BOUNTY_SETTINGS_CHANGED,
  VAULT_DEPOSIT,
} from './eventTypes'

import { INITIAL_STATE } from './'

import {
  initializeGraphQLClient,
  syncRepos,
  loadReposFromQueue,
  loadIssueData,
  determineWorkStatus,
  updateIssueDetail,
  syncIssues,
  syncTokens,
  syncSettings
} from './helpers'

import { STATUS } from '../utils/github'

export const handleEvent = async (state, action, vaultAddress, vaultContract) => {
  const { event, returnValues, address } = action

  switch (event) {
  case REQUESTING_GITHUB_TOKEN: {
    return state
  }
  case REQUESTED_GITHUB_TOKEN_SUCCESS: {
    const { token } = returnValues
    if (token) {
      initializeGraphQLClient(token)
    }

    const loadedRepos = await loadReposFromQueue(state)

    const status = STATUS.AUTHENTICATED
    state.github = {
      token,
      status,
      event: null
    }
    state.repos = [ ...state.repos, ...loadedRepos ]

    return state
  }
  case REQUESTED_GITHUB_TOKEN_FAILURE: {
    return state
  }
  case REQUESTED_GITHUB_DISCONNECT: {
    state.github = INITIAL_STATE
    return state
  }
  case REPO_ADDED: {
    return await syncRepos(state, returnValues)
  }
  case REPO_REMOVED: {
    const id = returnValues.repoId
    const repoIndex = state.repos.findIndex(repo => repo.id === id)
    if (repoIndex === -1) return state
    state.repos.splice(repoIndex,1)
    return state
  }
  case BOUNTY_ADDED: {
    if(!returnValues) return state
    const { repoId, issueNumber } = returnValues
    let issueData = await loadIssueData({ repoId, issueNumber })
    issueData = determineWorkStatus(issueData)
    return syncIssues(state, returnValues, issueData, [])
  }
  case ASSIGNMENT_REQUESTED: {
    if(!returnValues) return state
    const { repoId, issueNumber } = returnValues
    let issueData = await loadIssueData({ repoId, issueNumber })
    issueData = await updateIssueDetail(issueData)
    issueData = determineWorkStatus(issueData)
    return syncIssues(state, returnValues, issueData)
  }
  case ASSIGNMENT_APPROVED: {
    if(!returnValues) return state
    const { repoId, issueNumber } = returnValues
    let issueData = await loadIssueData({ repoId, issueNumber })
    issueData = await updateIssueDetail(issueData)
    issueData = determineWorkStatus(issueData)
    return syncIssues(state, returnValues, issueData)
  }
  case SUBMISSION_REJECTED: {
    if(!returnValues) return state
    const { repoId, issueNumber } = returnValues
    let issueData = await loadIssueData({ repoId, issueNumber })
    issueData = await updateIssueDetail(issueData)
    issueData = determineWorkStatus(issueData)
    return syncIssues(state, returnValues, issueData)
  }
  case WORK_SUBMITTED: {
    if(!returnValues) return state
    const { repoId, issueNumber } = returnValues
    let issueData = await loadIssueData({ repoId, issueNumber })
    issueData = await updateIssueDetail(issueData)
    issueData = determineWorkStatus(issueData)
    return syncIssues(state, returnValues, issueData)
  }
  case SUBMISSION_ACCEPTED: {
    if (!returnValues) return state
    const { repoId, issueNumber } = returnValues
    let issueData = await loadIssueData({ repoId, issueNumber })
    issueData = await updateIssueDetail(issueData)
    issueData = determineWorkStatus(issueData)
    return syncIssues(state, returnValues, issueData)
  }
  case BOUNTY_SETTINGS_CHANGED:
    state = await syncSettings(state) // No returnValues on this
    return await syncTokens(state, { token: state.bountySettings.bountyCurrency }, vaultContract )
  case VAULT_DEPOSIT:
    if (vaultAddress !== address) return state
    return await syncTokens(state, returnValues, vaultContract)
  default:
    return state
  }
}
