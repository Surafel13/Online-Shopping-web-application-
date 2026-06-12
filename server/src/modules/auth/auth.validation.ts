import z from "zod"

export const userSignupSchema = z.object({
    username : z.string().min(5, "Name must be at least 5 laters"),
    email : z.email("Invalid Email"),
    password : z.string().min(8, "Password must be at least 8 character"),
    role: z.enum(["customer", "admin"], "Out of decleard user role").default("customer"),

})


export const userLoginSchema = z.object({
    email : z.email("Invalid Email"), 
    password: z.string().min(8, "Password must be at least 8 character")
})
