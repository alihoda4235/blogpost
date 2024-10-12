import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, jwt, sign, verify } from 'hono/jwt'
import { Jwt } from 'hono/utils/jwt';



const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();

app.post('/api/v1/user/signup', async (c) => {
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

app.post('/api/v1/user/signin', async (c) => {
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

app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})


app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})


app.get('/api/v1/blog/bulk', (c) => {
  return c.text('Hello Hono!')
})


app.post('/api/v1/blog:id', (c) => {
  return c.text('Hello Hono!')
})

export default app
