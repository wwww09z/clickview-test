import { createContext, RefObject } from 'react'
import { FolderType } from './components/Folder'

interface TreeSettings {
  selectFolder: Function
  selected: string
  tree: FolderType[]
  setTree: Function
  setLatestId: Function
  latestId: number
  registerFolderRef: Function
  folderRefs: RefObject<{ [id: string]: HTMLElement | null }>
}

export const TreeSettingsContext = createContext<TreeSettings>({
  selectFolder: () => {},
  selected: '',
  tree: [],
  setTree: () => {},
  setLatestId: () => {},
  latestId: 0,
  registerFolderRef: () => {},
  folderRefs: { current: {} },
})
