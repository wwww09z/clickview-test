import { useState } from 'react'
import Folders from './Folders'

export interface FolderType {
  id: string
  name: string
  children?: FolderType[]
}

const Folder = ({
  folder,
  selectFolder,
  selected,
  setTree,
  position,
}: {
  folder: FolderType
  selectFolder: Function
  selected: string
  setTree: Function
  position: string[]
}) => {
  const { id, name: folderName, children } = folder
  const [isOpen, setIsOpen] = useState(false)
  const [currentName, setCurrentName] = useState(folderName)
  const hasChildren = children && children.length > 0
  return (
    <>
      <div style={{ cursor: 'pointer' }}>
        {hasChildren && (
          <span style={{ marginRight: '0.5rem' }} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '▼' : '▶'}
          </span>
        )}
        {selected === id ? (
          <input value={currentName} onChange={e => setCurrentName(e.target.value)} />
        ) : (
          <span onClick={() => selectFolder(id)}>{currentName}</span>
        )}
      </div>
      {children && (
        <div style={isOpen ? {} : { display: 'none' }}>
          {' '}
          <Folders
            folders={children}
            selectFolder={selectFolder}
            selected={selected}
            setTree={setTree}
            position={[...position, 'children']}
          />
        </div>
      )}
    </>
  )
}

export default Folder
