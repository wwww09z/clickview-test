import Folder, { FolderType } from './Folder'

const Folders = ({ folders, position }: { folders: FolderType[]; position: number[] }) => {
  return (
    <ul>
      {folders.map((folder, index) => (
        <Folder folder={folder} key={folder.id} position={[...position, index]} />
      ))}
    </ul>
  )
}

export default Folders
