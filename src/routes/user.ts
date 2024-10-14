import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, jwt, sign, verify } from 'hono/jwt'
import { Jwt } from 'hono/utils/jwt';




export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();

userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    try{
     const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
          name: body.name
        }
      })
      const token = await sign({
        id: user.id
      },c.env.JWT_SECRET);
  
      return c.text(token);
  
    }catch(e){
      c.status(403);
      return c.json("Wrong credentials/User already exists")
    }
  });
  
  userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    try{
     const user = await prisma.user.findFirst({
        where: {
          email: body.email,
          password: body.password,
          name: body.name
        }
      })
      if (!user){
        c.status(403)
        return c.json("user doesn't exist")
      }
      const token = await sign({
        id: user.id
      },c.env.JWT_SECRET);
  
      return c.text(token);
  
    }catch(e){
      c.status(403);
      return c.json("Invalid")
    }
  });
  
