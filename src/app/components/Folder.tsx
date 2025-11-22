import { useState } from 'react'
import Folders from './Folders'

interface DragData {
  sourceFolder: FolderType
  sourcePosition: number[]
}

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
  const handleDropStart = (
    e: React.DragEvent<HTMLElement>,
    sourceFolder: FolderType,
    sourcePosition: number[],
  ) => {
    const transferData = {
      sourceFolder,
      sourcePosition,
    }
    e.dataTransfer.setData('text/json', JSON.stringify(transferData))
  }
  const handleDrop = (e: React.DragEvent<HTMLElement>, targetPosition: number[]) => {
    e.preventDefault()
    const dragDataStr = e.dataTransfer.getData('text/json')
    const dragData = JSON.parse(dragDataStr) as DragData
    const { sourceFolder, sourcePosition } = dragData
    // check to avoid move folder into itself or its children
    if (JSON.stringify(targetPosition).startsWith(JSON.stringify(sourcePosition).slice(0, -1)))
      return alert('Cannot move folder into itself or its children!')

    setIsOpen(true)
    setTree((preTreeStr: string) => {
      // add source folder to target
      const preTree = JSON.parse(preTreeStr)
      const target = getTarget(preTree, [...targetPosition])
      // remove source folder
      deleteTarget(preTree, [...sourcePosition])
      // add new after removing to avoid index change
      if (target?.children) {
        target.children.push(sourceFolder)
      }
      return JSON.stringify(preTree)
    })
  }
  return (
    <>
      <div
        style={{ cursor: 'pointer' }}
        onDrop={e => handleDrop(e, position)}
        onDragOver={e => e.preventDefault()}
        draggable
        onDragStart={e => handleDropStart(e, folder, position)}>
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
