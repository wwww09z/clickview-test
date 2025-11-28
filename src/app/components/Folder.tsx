import { RefObject, useContext, useEffect, useRef, useState } from 'react'
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

export const blankFolder = (newLatestId: number) => {
  return {
    id: newLatestId.toString(),
    name: '',
    children: [],
  }
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

const moveFocus = (
  position: number[],
  moveChange: number,
  tree: FolderType[],
  folderRefs: RefObject<{ [id: string]: HTMLElement | null }>,
  isOpen: boolean,
) => {
  const nextPosition = [...position]
  const last = nextPosition.length - 1
  const candidate = nextPosition[last] + moveChange

  if (candidate < 0) {
    // go to parent
    nextPosition.pop()
  } else if (isOpen && moveChange === 1) {
    // go to first child
    nextPosition.push(0)
  } else {
    nextPosition[last] = candidate
    const maybe = getTarget(tree, nextPosition)
    if (!maybe) {
      // fallback to parent
      while (nextPosition.length > 1) {
        if (getTarget(tree, nextPosition)) break
        nextPosition.pop()
        nextPosition[nextPosition.length - 1] += 1
      }
    }
  }

  const target = getTarget(tree, nextPosition)
  if (!target) return

  folderRefs.current[target.id]?.focus()
}

const Folder = ({ folder, position }: { folder: FolderType; position: number[] }) => {
  const treeSettings = useContext(TreeSettingsContext)
  const {
    selectFolder,
    selected,
    tree,
    setTree,
    setLatestId,
    latestId,
    registerFolderRef,
    folderRefs,
  } = treeSettings
  const { id, name: folderName, children } = folder
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = children && children.length > 0
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (selected && inputRef.current) inputRef.current.focus()
  }, [selected])

  const handleRename = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target
    // trigger browser validation UI
    const ok = input.reportValidity()
    if (!ok) return

    const next = e.relatedTarget as HTMLElement | null
    const newName = e.target.value
    if (newName !== folderName) {
      const target = getTarget(tree, position)
      if (target) {
        target.name = newName
        setTree(tree)
      }
    }
    if (!next) selectFolder('')
  }

  const handleAdd = () => {
    const newLatestId = latestId + 1
    const target = getTarget(tree, [...position])
    if (target?.children) {
      setIsOpen(true)
      const newFolder: FolderType = blankFolder(newLatestId)
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

  // handle drag and drop
  const handleDropStart = (e: React.DragEvent<HTMLElement>) => {
    const transferData = {
      sourceFolder: folder,
      sourcePosition: position,
    }
    e.dataTransfer.setData('text/json', JSON.stringify(transferData))
  }
  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    const dragDataStr = e.dataTransfer.getData('text/json')
    const dragData = JSON.parse(dragDataStr) as DragData
    const { sourceFolder, sourcePosition } = dragData
    // check to avoid move folder into itself or its children
    if (JSON.stringify(position).startsWith(JSON.stringify(sourcePosition).slice(0, -1)))
      return alert('Cannot move folder into itself or its children!')

    setIsOpen(true)
    const target = getTarget(tree, position)
    // add new after removing to avoid index change
    if (target?.children) {
      // remove source folder
      const updatedTree = deleteTarget(tree, sourcePosition)
      target.children.push(sourceFolder)
      setTree(updatedTree)
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = e => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        moveFocus(position, 1, tree, folderRefs, isOpen)
        break
      case 'ArrowUp':
        e.preventDefault()
        moveFocus(position, -1, tree, folderRefs, isOpen)
        break
      case 'ArrowRight':
        e.preventDefault()
        setIsOpen(true)
        break
      case 'ArrowLeft':
        e.preventDefault()
        setIsOpen(false)
        break
      case 'Enter':
        e.preventDefault()
        // trigger same as click
        selectFolder(id)
        break
    }
  }
  return (
    <>
      <div
        style={{ cursor: 'pointer' }}
        onDrop={e => handleDrop(e)}
        onDragOver={e => e.preventDefault()}
        draggable
        onDragStart={e => handleDropStart(e)}>
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
          <span
            id={id}
            onClick={() => selectFolder(id)}
            onKeyDown={handleKeyDown}
            tabIndex={Number(id)}
            ref={registerFolderRef(id)}>
            {folderName}
          </span>
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
