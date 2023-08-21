'use client'

import { useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import JaroWinkler from '@/lib/jaro'
import { Result } from '@/lib/types'
import { fetcher } from '@/lib/utils'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchType, setSearchType] = useState<string>('track')
  const { data: searchResults, error } = useSWR(
    searchQuery ? `/api/search?q=${searchQuery}&type=${searchType}` : null,
    fetcher
  )

  if (error) return <div>Failed to load. Please try again.</div>

  const sortedResults = searchResults?.results
    .map((result: Result) => ({
      ...result,
      similarity: JaroWinkler(
        searchQuery.toLowerCase(),
        result.name.toLowerCase()
      )
    }))
    .sort((a: Result, b: Result) => b.similarity - a.similarity)
    .map(({ name, image, uri, type }: Result) => ({ name, image, uri, type }))

  return (
    <main className='container flex flex-col items-center justify-center gap-4 pt-4 md:max-w-[60rem]'>
      <h1 className='text-xl font-semibold'>Spotify Search</h1>
      <div className='flex items-center justify-center gap-2'>
        <Input
          type='text'
          placeholder='Search...'
          value={searchQuery}
          className='w-[16.5rem] md:w-[30rem]'
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Select defaultValue='track' onValueChange={setSearchType}>
          <SelectTrigger className='w-24 md:w-32'>
            <SelectValue placeholder='Select a type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='album' onClick={e => e.stopPropagation()}>
              Album
            </SelectItem>
            <SelectItem value='artist' onClick={e => e.stopPropagation()}>
              Artist
            </SelectItem>
            <SelectItem value='playlist' onClick={e => e.stopPropagation()}>
              Playlist
            </SelectItem>
            <SelectItem value='track' onClick={e => e.stopPropagation()}>
              Track
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {searchQuery && (
        <>
          {!sortedResults ? (
            <div>Loading...</div>
          ) : (
            <div className='grid grid-cols-2 gap-4 pb-8 md:grid-cols-4'>
              {sortedResults.map((result: Result, index: number) => (
                <div
                  key={index}
                  className='relative flex flex-col rounded-sm bg-accent p-4'
                >
                  <Image
                    src={result.image}
                    alt={result.name}
                    width={640}
                    height={640}
                  />
                  <p className='pt-4 text-lg font-semibold'>{result.name}</p>
                  <p className='text-foreground/80'>
                    {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                  </p>
                  <a
                    href={result.uri}
                    target='_blank'
                    className='absolute inset-0'
                    onClick={e => e.currentTarget.blur()}
                  >
                    <span className='sr-only'>Open on Spotify</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
