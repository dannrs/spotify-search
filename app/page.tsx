import Search from '@/components/search'
import { Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className='container flex flex-col items-center justify-center space-y-2 pt-4 md:max-w-[60rem]'>
      <h1 className='text-xl font-semibold'>Spotify Search</h1>
      <h2>Quickly search albums, artists, tracks, and playlists from Spotify</h2>
      <Link
        href='https://github.com/dannrs/spotify-search'
        target='_onblank'
        className='hover:text-primary-dark flex items-center text-primary pb-4'
      >
        <LinkIcon className='h-4 w-4' />
        &nbsp;
        <span className='underline-offset-4 hover:underline'>Github</span>
      </Link>
      <Search />
    </main>
  )
}
