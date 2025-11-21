import Folder, { FolderType } from './Folder'
const Folders = ({
  folders,
  selectFolder,
  selected,
  setTree,
  position,
}: {
  folders: FolderType[]
  selectFolder: Function
  selected: string
  setTree: Function
  position: string[]
}) => {
  return (
    <ul>
      {folders.map((folder, index) => (
        <Folder
          folder={folder}
          key={folder.id}
          selectFolder={selectFolder}
          selected={selected}
          setTree={setTree}
          position={[...position, index.toString()]}
        />
      ))}
    </ul>
  )
}

export default Folders
