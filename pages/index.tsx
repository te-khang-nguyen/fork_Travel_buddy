import { useGetUsersQuery } from "@/libs/services/user"

export default function Home(){
    const {data  } = useGetUsersQuery({})
    console.log(data)

    return <>aaaba</>
}