import { useState } from 'react'
import Folders from './Folders'

export interface FolderType {
  id: string
  name: string
  children?: FolderType[]
}

export const getTarget = (tree: FolderType[], position: number[]): FolderType | null => {
  if (tree && tree.length > 0 && position.length > 0) {
    const currentPosition = position.shift()
    const currentPositionExists = currentPosition !== undefined && currentPosition !== null
    if (currentPositionExists && tree[currentPosition]) {
      const currentTree = tree[currentPosition]?.children
      return currentTree && currentTree.length > 0 && position.length > 0
        ? getTarget(currentTree, position)
        : tree[currentPosition]
    }
  }
  return null
}

const deleteTarget = (tree: FolderType[], position: number[]) => {
  if (tree && tree.length > 0 && position.length > 0) {
    const currentPosition = position.shift()
    const currentPositionExists = currentPosition !== undefined && currentPosition !== null
    if (currentPositionExists && tree[currentPosition]) {
      const currentTree = tree[currentPosition]?.children
      if (currentTree && currentTree.length > 0 && position.length > 0)
        deleteTarget(currentTree, position)
      else tree.splice(currentPosition, 1)
    }
  }
}

const Folder = ({
  folder,
  selectFolder,
  selected,
  setTree,
  position,
  setLatestId,
  latestId,
}: {
  folder: FolderType
  selectFolder: Function
  selected: string
  setTree: Function
  position: number[]
  setLatestId: Function
  latestId: number
}) => {
  const { id, name: folderName, children } = folder
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = children && children.length > 0
  const handleRename = (newName: string, targetPosition: number[]) => {
    if (newName !== folderName) {
      setTree((preTreeStr: string) => {
        const preTree = JSON.parse(preTreeStr)
        const target = getTarget(preTree, [...targetPosition])
        if (target) {
          target.name = newName
        }
        return JSON.stringify(preTree)
      })
      selectFolder('')
    }
  }
  const handleAdd = () => {
    const newLatestId = latestId + 1
    setIsOpen(true)
    setTree((preTreeStr: string) => {
      const preTree = JSON.parse(preTreeStr)
      const target = getTarget(preTree, [...position])
      if (target?.children) {
        const newFolder: FolderType = {
          id: newLatestId.toString(),
          name: '',
          children: [],
        }
        target.children.push(newFolder)
      }
      return JSON.stringify(preTree)
    })
    selectFolder(newLatestId.toString())
    setLatestId(newLatestId)
  }
  const handleRemove = () => {
    setTree((preTreeStr: string) => {
      const preTree = JSON.parse(preTreeStr)
      deleteTarget(preTree, [...position])
      return JSON.stringify(preTree)
    })
    selectFolder('')
  }
  return (
    <>
      <div style={{ cursor: 'pointer' }}>
        {hasChildren && (
          <span style={{ marginRight: '0.5rem' }} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '▼' : '▶'}
          </span>
        )}
        {selected === id ? (
          <>
            <input
              defaultValue={folderName}
              onBlur={e => handleRename(e.target.value, position)}
              required
            />
            <button onClick={handleAdd}>Add</button>
            <button onClick={handleRemove}>Remove</button>
          </>
        ) : (
          <span onClick={() => selectFolder(id)}>{folderName}</span>
        )}
      </div>
      {children && children.length > 0 && (
        <div style={isOpen ? {} : { display: 'none' }}>
          <Folders
            folders={children}
            selectFolder={selectFolder}
            selected={selected}
            setTree={setTree}
            position={position}
            setLatestId={setLatestId}
            latestId={latestId}
          />
        </div>
      )}
    </>
  )
}

export default Folder
