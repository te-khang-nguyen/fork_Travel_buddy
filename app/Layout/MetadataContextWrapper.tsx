import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { GiCompass } from "react-icons/gi";
import Head from "next/head";
import { baseUrl } from "../constant";
import { useRouter } from "next/router";

interface MetadataContextProps {
  title: string;
  description: string;
  urlSlug: string;
  seoExcerpt: string;
  hashtags: string[];
  longTailKeyword: string;
  setMetadata: (metadata: {
    title: string, 
    description: string, 
    urlSlug: string, 
    seoExcerpt?: string, 
    hashtags?: string[],
    longTailKeyword?: string,
  }) => void;
}

const metdataRouteMap = [
    {
        title: 'Login - Travel Buddy', 
        description:'Welcome to My Travel Buddy.',
        slug: "/",
        seoSlug: "/"
    },
    {
        title: 'Registration - Travel Buddy', 
        description:'Welcome to My Travel Buddy.',
        slug: "/register",
        seoSlug: "/register"
    },
    {
        title: 'Home - Travel Buddy', 
        description:'Welcome to My Travel Buddy.',
        slug: "/dashboard/user",
        seoSlug: "/home"
    },
    {
        title: 'Explore - Travel Buddy', 
        description:'Explore our wondrous world.',
        slug: "/destination/select",
        seoSlug: "/explore"
    },
    {
        title: 'Travel Story Writing - Travel Buddy', 
        description:'Create your travel story with AI.',
        slug: "/profile/user/story/create",
        seoSlug: "/story-writing"
    },
]

const MetadataContext = createContext<MetadataContextProps | undefined>(undefined);

export const MetadataProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const path = router.pathname;
  const matchedPage = metdataRouteMap.find((e)=> e.slug === path);

  const [title, setTitle] = useState("Travel Buddy");
  const [description, setDescription] = useState("Your travel companion for planning and sharing trips.");
  const [urlSlug, setUrlSlug] = useState<string>("");
  const [seoExcerpt, setSeoExcerpt] = useState<string>("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [longTailKeyword, setLongTailKeyword] = useState<string>("");

  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  const setMetadata = (newMetadata: {
    title: string, 
    description: string, 
    urlSlug: string, 
    seoExcerpt?: string, 
    hashtags?: string[],
    longTailKeyword?: string
  }) => {
    setTitle(newMetadata.title);
    setDescription(newMetadata.description);
    setUrlSlug(newMetadata.urlSlug);
    setSeoExcerpt(newMetadata.seoExcerpt || "");
    setHashtags(newMetadata.hashtags || []);
    setLongTailKeyword(newMetadata.longTailKeyword || "");
  };

  useEffect(()=>{
    if(matchedPage){
        setMetadata({
            title: matchedPage?.title || '', 
            description: matchedPage?.description || '', 
            urlSlug: `${baseUrl}/${matchedPage?.seoSlug}` || '',  
        });
    }
  },[matchedPage]);

  return (
    <MetadataContext.Provider 
        value={{
            title, 
            description, 
            urlSlug, 
            seoExcerpt, 
            hashtags, 
            longTailKeyword, 
            setMetadata 
        }}
    >
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:url" content={urlSlug} />
        <meta property="og:description" content={seoExcerpt} />
        <meta name="keywords" content={hashtags.join(", ")} />
        <meta name="long-tail-keywords" content={longTailKeyword} />
      </Head>
      {children}
    </MetadataContext.Provider>
  );
};

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error("useMetadata must be used within a MetadataProvider");
  }
  return context;
};