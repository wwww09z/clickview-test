'use client'
import { useState } from 'react'
import Folders from './components/Folders'
import { blankFolder, FolderType } from './components/Folder'
import { TreeSettingsContext } from './context'

const initialTree = [
  {
    id: '1',
    name: 'Science',
    children: [
      {
        id: '2',
        name: 'Biology',
        children: [],
      },
      {
        id: '3',
        name: 'Chemistry',
        children: [
          { id: '4', name: 'Atoms', children: [] },
          { id: '5', name: 'Chemical Reactions', children: [] },
        ],
      },
    ],
  },
  {
    id: '6',
    name: 'Mathematics',
    children: [
      {
        id: '7',
        name: 'Algebra',
        children: [
          { id: '8', name: 'Complex Numbers', children: [] },
          { id: '9', name: 'Linear Equations', children: [] },
        ],
      },
      {
        id: '10',
        name: 'Geometry',
        children: [],
      },
    ],
  },
]

export default function Home() {
  const [selected, setSelected] = useState('')
  const [tree, setTree] = useState<FolderType[]>(initialTree)
  const [latestId, setLatestId] = useState(10)

  const handleAdd = () => {
    const newLatestId = latestId + 1
    setTree((tree: FolderType[]) => {
      const preTree = [...tree]
      const newFolder: FolderType = blankFolder(newLatestId)
      preTree.push(newFolder)
      return [...preTree]
    })
    setSelected(newLatestId.toString())
    setLatestId(newLatestId)
  }
  return (
    <TreeSettingsContext.Provider
      value={{
        selectFolder: setSelected,
        selected: selected,
        tree: tree,
        setTree,
        setLatestId,
        latestId,
      }}>
      <Folders folders={tree} position={[]} />
      <div>
        <button onClick={handleAdd}>Add Root Folder</button>
      </div>
    </TreeSettingsContext.Provider>
  )
}
