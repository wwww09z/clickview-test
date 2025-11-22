'use client'
import { useState } from 'react'
import Folders from './components/Folders'
import { FolderType } from './components/Folder'

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
  const [treeStr, setTree] = useState<string>(JSON.stringify(initialTree))
  const [latestId, setLatestId] = useState(10)
  const tree = JSON.parse(treeStr)

  const handleAdd = () => {
    const newLatestId = latestId + 1
    setTree((preTreeStr: string) => {
      const preTree = JSON.parse(preTreeStr)
      const newFolder: FolderType = {
        id: newLatestId.toString(),
        name: '',
        children: [],
      }
      preTree.push(newFolder)
      return JSON.stringify(preTree)
    })
    setSelected(newLatestId.toString())
    setLatestId(newLatestId)
  }
  return (
    <>
      <Folders
        folders={JSON.parse(treeStr)}
        selectFolder={setSelected}
        selected={selected}
        setTree={setTree}
        position={[]}
        setLatestId={setLatestId}
        latestId={latestId}
      />
      <div>
        <button onClick={handleAdd}>Add Root Folder</button>
      </div>
    </>
  )
}
