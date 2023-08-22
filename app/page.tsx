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
import { cn, fetcher } from '@/lib/utils'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchType, setSearchType] = useState<string>('track')
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const { data: searchResults, error } = useSWR(
    searchQuery ? `/api/search?q=${searchQuery}&type=${searchType}` : null,
    fetcher
  )

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
      <div className='flex w-full items-center justify-center gap-2'>
        <Input
          type='text'
          placeholder='Search...'
          value={searchQuery}
          className='w-3/4 md:w-[87%] lg:w-[90%]'
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Select
          defaultValue='track'
          onValueChange={setSearchType}
          onOpenChange={setIsDropdownOpen}
        >
          <SelectTrigger className='w-1/4 md:w-[13%] lg:w-[10%]'>
            <SelectValue placeholder='Select a type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='album'>Album</SelectItem>
            <SelectItem value='artist'>Artist</SelectItem>
            <SelectItem value='playlist'>Playlist</SelectItem>
            <SelectItem value='track'>Track</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {searchQuery && (
        <>
          {!sortedResults ? (
            <div>Loading...</div>
          ) : (
            <>
              <div
                className={cn(
                  'grid grid-cols-2 gap-4 pb-8 md:grid-cols-3 lg:grid-cols-4',
                  isDropdownOpen ? 'pointer-events-none' : 'pointer-events-auto'
                )}
              >
                {sortedResults.map((result: Result, index: number) => (
                  <div
                    key={index}
                    className='relative flex flex-col rounded-sm bg-accent p-4'
                  >
                    {result.image ? (
                      <Image
                        unoptimized
                        src={result.image}
                        alt={result.name}
                        width={640}
                        height={640}
                      />
                    ) : (
                      <div className='flex h-[180px] w-[180px] items-center justify-center bg-[#E5E9ED]'>
                        {result.name}
                      </div>
                    )}
                    <p className='pt-4 text-lg font-semibold'>{result.name}</p>
                    <p className='text-foreground/80'>
                      {result.type.charAt(0).toUpperCase() +
                        result.type.slice(1)}
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
              {error && <div>Failed to load. Please try again.</div>}
            </>
          )}
        </>
      )}
    </main>
  )
}
