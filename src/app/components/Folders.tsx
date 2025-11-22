import Folder, { FolderType } from './Folder'
const Folders = ({
  folders,
  selectFolder,
  selected,
  setTree,
  position,
  setLatestId,
  latestId,
}: {
  folders: FolderType[]
  selectFolder: Function
  selected: string
  setTree: Function
  position: number[]
  setLatestId: Function
  latestId: number
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
          position={[...position, index]}
          setLatestId={setLatestId}
          latestId={latestId}
        />
      ))}
    </ul>
  )
}

export default Folders
