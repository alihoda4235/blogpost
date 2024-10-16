import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, jwt, sign, verify } from 'hono/jwt'
import { Jwt } from 'hono/utils/jwt';
import { CreateBlogSchema, UpdateBlogSchema } from "@ali_hoda/blog-common";


  
export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string,
      JWT_SECRET: string
    };
    Variables: {
      userId: string
    }
  }>();

  blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    try {
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      const user = await verify(token, c.env.JWT_SECRET);
      
      if (user) {
        c.set("userId", user.id as string);
        await next();
      } else {
        c.status(403);
        return c.json({
          message: "You are not logged in",
        });
      }
    } catch (e) {
      c.status(403);
      return c.json({
        message: "You are not logged in", 
      });
    }
  });
  

  blogRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    
    const {success} = CreateBlogSchema.safeParse(body);
    if(!success){
      c.status(403);
      return c.json({
        message: "Invalid inputs"
      })
    }

    const authorId = c.get("userId") 
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId)
      }
    })
    return c.json({
      id: blog.id
    })
  })
  
  
  blogRouter.put('/', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();

    const {success} = UpdateBlogSchema.safeParse(body);
    if(!success){
      c.status(403);
      return c.json({
        message: "Invalid inputs"
      })
    }

    const blog = await prisma.blog.update({
      where: {
        id: body.id
      },
      data: {
        title: body.title,
        content: body.content,
      }
    })   
    return c.json({
      id: blog.id
    })
  })


  blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();

    const blogs = await prisma.blog.findMany()

    return c.json({
      blogs
    })
  })
  

  blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const id =  c.req.param("id");

    try {
      const blog = await prisma.blog.findFirst({
        where: {
          id: Number(id),
        },
      });
    
      return c.json({ blog });
    
    } catch (e) {
      c.status(411);
      return c.json({
        message: "Error while fetching blog post",
      });
    }
    
  })




  
