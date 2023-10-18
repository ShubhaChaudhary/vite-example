interface myUser {
    name: string,
    email?:string,
    id: number
}

type modifiedUser = Required<myUser>