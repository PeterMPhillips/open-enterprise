import { useContext } from 'react'
import { PANELS, PanelContext } from '../Panel'
import { useAragonApi } from '@aragon/api-react'

const usePanelManagement = () => {
  const { setActivePanel, setPanelProps } = useContext(PanelContext)
  const { appState } = useAragonApi()
  return {
    allocateBounty: issues => {
      setActivePanel(PANELS.FundIssues)
      setPanelProps({
        issues,
        mode: 'new',
      })
    },
    closePanel: () => {
      setActivePanel(null)
      setPanelProps({})
    },
    curateIssues: (selectedIssues, allIssues) => {
      setActivePanel(PANELS.NewIssueCuration)
      setPanelProps({
        selectedIssues,
        allIssues,
      })
    },
    requestAssignment: issue => {
      setActivePanel(PANELS.RequestAssignment)
      setPanelProps({ issue })
    },
    setupNewIssue: () => {
      const repoNames =
        (appState.repos &&
          appState.repos.map(repo => ({
            name: repo.metadata.name,
            id: repo.data._repo,
          }))) ||
        'No repos'
      const reposIds = (appState.repos || []).map(repo => repo.data.repo)

      setActivePanel(PANELS.NewIssue)
      setPanelProps({
        reposManaged: repoNames,
        reposIds,
      })
    },
    setupNewProject: () => {
      // TODO: Review
      // This is breaking RepoList loading sometimes preventing show repos after login
      const reposAlreadyAdded = (appState.repos || []).map(
        repo => repo.data._repo
      )
      setActivePanel(PANELS.NewProject)
      setPanelProps({ reposAlreadyAdded })
    },
    viewFunding: issue => {
      const fundingEventId = issue.id // FIXME: what attribute links issues from the same funding event?
      setActivePanel(PANELS.ViewFunding)
      setPanelProps({
        createdBy: issue.fundingHistory[0].user, // FIXME: does not contain Eth address; how to retrieve it?
        fundingEventId,
        title: 'Issue Funding #Unknown',
      })
    },
  }
}

export default usePanelManagement
