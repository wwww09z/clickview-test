'use client'
import { useState } from 'react'
import styles from './page.module.css'
import Folders from './components/Folders'

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
  const [tree, setTree] = useState(initialTree)
  return (
    <Folders
      folders={tree}
      selectFolder={setSelected}
      selected={selected}
      setTree={setTree}
      position={[]}></Folders>
  )
}
