'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";



export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('username');

const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await axios.get('https://jsonplaceholder.typicode.com/users')
        const data = (await res.data) as any
        return data
      } catch (error) {
        return null
      }
    },
  })

const { data: albumData } = useQuery({
    queryKey: ['album'],
    queryFn: async () => {
      try {
        const res = await axios.get('https://jsonplaceholder.typicode.com/albums')
        const data = (await res.data) as any
        return data
      } catch (error) {
        return null
      }
    },
  })

  const { data: photoData } = useQuery({
    queryKey: ['photo'],
    queryFn: async () => {
      try {
        const res = await axios.get('https://jsonplaceholder.typicode.com/photos')
        const data = (await res.data) as any
        return data
      } catch (error) {
        return null
      }
    },
  })

  console.log(userData)

return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-50 py-4 border-b">
        <Select value={filterType} onValueChange={(val) => val && setFilterType(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="username">Username</SelectItem>
            <SelectItem value="album">Album Title</SelectItem>
            <SelectItem value="photo">Photo ID</SelectItem>
          </SelectContent>
        </Select>
        <Input 
          className="max-w-sm" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {userData
        ?.filter((user: any) => {
          if (!searchTerm) return true;
          if (filterType === 'username') {
            return user.name.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (filterType === 'album') {
             return albumData?.some((a: any) => a.userId === user.id && a.title.toLowerCase().includes(searchTerm.toLowerCase()));
          }
          if (filterType === 'photo') {
             return albumData?.some((a: any) => a.userId === user.id && photoData?.some((p: any) => p.albumId === a.id && p.id.toString() === searchTerm));
          }
          return true;
        })
        .map((user: any) => {
          const userAlbums = albumData?.filter((a: any) => a.userId === user.id) || [];
          const filteredAlbums = userAlbums.filter((album: any) => {
            if (!searchTerm) return true;
            if (filterType === 'username') return true;
            if (filterType === 'album') return album.title.toLowerCase().includes(searchTerm.toLowerCase());
            if (filterType === 'photo') return photoData?.some((p: any) => p.albumId === album.id && p.id.toString() === searchTerm);
            return true;
          });

          if (filteredAlbums.length === 0) return null;

          return (
            <div key={user.id} className="space-y-4">
              <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAlbums.map((album: any) => {
                   const albumPhotos = photoData?.filter((p: any) => p.albumId === album.id) || [];
                   const filteredPhotos = albumPhotos.filter((photo: any) => {
                       if (!searchTerm) return true;
                       if (filterType === 'photo') return photo.id.toString() === searchTerm;
                       return true;
                   });

                   return filteredPhotos.map((photo: any) => (
                    <Card
                      key={photo.id}
                      className="relative w-full max-w-sm overflow-hidden pt-0 h-full flex flex-col hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={`https://picsum.photos/seed/${photo.id}/800/600`}
                        alt={photo.title}
                        title={photo.title}
                        className="relative z-20 aspect-video w-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <CardHeader>
                        <CardTitle className="line-clamp-2 text-base">{photo.id} {album.title}</CardTitle>
                      </CardHeader>
                      <CardFooter className="mt-auto flex flex-col items-start gap-2 pt-0">
                        <p className="text-xs text-muted-foreground break-all font-mono mt-2">
                          <a href={photo.thumbnailUrl} target="_blank" rel="noreferrer" className="hover:underline text-primary">
                            {photo.thumbnailUrl}
                          </a>
                        </p>
                      </CardFooter>
                    </Card>
                  ));
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}