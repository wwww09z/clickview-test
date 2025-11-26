import { useContext, useEffect, useRef, useState } from 'react'
import Folders from './Folders'
import { TreeSettingsContext } from '../context'

interface DragData {
  sourceFolder: FolderType
  sourcePosition: number[]
}

export interface FolderType {
  id: string
  name: string
  children?: FolderType[]
}

export const getTarget = (tree: FolderType[], position: number[], depth = 0): FolderType | null => {
  if (!tree || tree.length === 0 || depth >= position.length) return null
  const idx = position[depth]
  const node = tree[idx]
  if (!node) return null
  if (depth === position.length - 1) return node
  return getTarget(node.children ?? [], position, depth + 1)
}

const deleteTarget = (tree: FolderType[], position: number[], depth = 0): FolderType[] => {
  if (!tree || tree.length === 0 || depth >= position.length) return tree
  const idx = position[depth]
  if (idx == null || !tree[idx]) return tree

  if (depth === position.length - 1) {
    // remove this node immutably
    return tree.filter((_, i) => i !== idx)
  }

  const newTree = [...tree]
  newTree[idx].children = deleteTarget(newTree[idx].children ?? [], position, depth + 1)
  return [...newTree]
}

const Folder = ({ folder, position }: { folder: FolderType; position: number[] }) => {
  const treeSettings = useContext(TreeSettingsContext)
  const { selectFolder, selected, tree, setTree, setLatestId, latestId } = treeSettings
  const { id, name: folderName, children } = folder
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = children && children.length > 0
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (selected && inputRef.current) inputRef.current.focus()
  }, [selected])

  const handleRename = (e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as HTMLElement | null
    const newName = e.target.value
    if (newName !== folderName) {
      const target = getTarget(tree, position)
      if (target) {
        target.name = newName
        setTree(tree)
      }
    }
    // console.error('==> newName: ', JSON.stringify(newName))
    if (!next) selectFolder('')
  }

  const handleAdd = () => {
    const newLatestId = latestId + 1
    const target = getTarget(tree, [...position])
    if (target?.children) {
      setIsOpen(true)
      const newFolder: FolderType = {
        id: newLatestId.toString(),
        name: '',
        children: [],
      }
      target.children = [...target.children, newFolder]
      setTree(tree)
      selectFolder(newLatestId.toString())
      setLatestId(newLatestId)
    }
  }
  const handleRemove = () => {
    const updatedTree = deleteTarget(tree, position)
    setTree(updatedTree)
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
    setTree((tree: FolderType[]) => {
      // add source folder to target
      // const preTree = JSON.parse(preTreeStr)
      const preTree = [...tree]
      const target = getTarget(preTree, [...targetPosition])
      // remove source folder
      deleteTarget(preTree, [...sourcePosition])
      // add new after removing to avoid index change
      if (target?.children) {
        target.children.push(sourceFolder)
      }
      return [...preTree]
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
              onBlur={e => handleRename(e)}
              ref={inputRef}
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
          <Folders folders={children} position={position} />
        </div>
      )}
    </>
  )
}

export default Folder
