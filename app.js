const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const session = require('express-session')
const { PrismaClient } = require('@prisma/client')
const middleware = require('./middleware')
const app = express()
const port = 3000
const prisma = new PrismaClient

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
    session({
      secret: 'b1gS3cr3tK3yW1thL0t5OfR@nd0mCh@r@ct3r5', 
      resave: false,
      saveUninitialized: false,
    })
);

app.use((req, res, next) => {
    res.locals.userId = req.session.userId || null;
    next();
});


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/register', middleware.redirectToHomeIfLoggedIn, (req, res) => {
    res.render('register', { message : ''})
})

app.post('/register', async (req, res) => {
    const {username, password} = req.body

    try{
        const exitingUser = await prisma.User.findUnique({
            where: {username}
        })

        if(exitingUser){
            res.render('register', { message: 'Username sudah terdaftar, silahkan gunakan username lain!'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        
        await prisma.User.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        res.redirect('/login')
    }catch(error){
        console.error('Error during registration:', error);
        res.status(500).send('Terjadi kesalahan saat mendaftarkan pengguna');
    }

})

app.get('/login', middleware.redirectToHomeIfLoggedIn, (req, res) => {
    if (req.session.userId) {
        return res.redirect('/forum'); 
      }
    res.render('login', { message: '' })
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { message: 'Username atau password salah' });
      }

      req.session.userId = user.id;

      res.redirect('/forum');
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Terjadi kesalahan saat login');
    }
  });
  

  app.get('/forum', async (req, res) => {
    try {
      const userId = req.session.userId; 
  
      const topics = await prisma.forum.findMany({
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      res.render('forum', { topics, userId }); 
    } catch (error) {
      console.error('Error fetching forum topics:', error);
      res.status(500).send('Terjadi kesalahan saat mengambil topik forum');
    }
  });

  app.post('/discussion/:forumId/edit', middleware.requireLogin, async (req, res) => {
    const { forumId } = req.params;
    const { title, content } = req.body;
    const userId = req.session.userId;
  
    try {
      const forum = await prisma.forum.findUnique({
        where: {
          id: parseInt(forumId),
        },
      });
  
      if (!forum) {
        return res.status(404).send('Topik tidak ditemukan.');
      }
  
      if (forum.userId !== userId) {
        return res.status(403).send('Anda tidak diizinkan untuk mengedit topik ini.');
      }
  
      await prisma.forum.update({
        where: {
          id: forum.id,
        },
        data: {
          title,
          content,
        },
      });
  
      res.redirect(`/discussion/${forumId}`); 
    } catch (error) {
      console.error('Error during updating forum:', error);
      res.status(500).send('Terjadi kesalahan saat memperbarui topik');
    }
  });

app.get('/discussion/:forumId', async (req, res) => {
    try {
      const { forumId } = req.params;
  
      const forum = await prisma.forum.findUnique({
        where: {
          id: parseInt(forumId),
        },
        include: {
          user: true,
          comments: {
            include: {
              user: true,
            },
          },
        },
      });
  
      res.render('discussion', { forum });
    } catch (error) {
      console.error('Error fetching discussion:', error);
      res.status(500).send('Terjadi kesalahan saat mengambil data diskusi');
    }
  });

  app.post('/discussion/:forumId/comment', middleware.requireLogin, async (req, res) => {
    const { forumId } = req.params;
    const { content } = req.body;
    const userId = req.session.userId;
  
    try {
      const newComment = await prisma.comment.create({
        data: {
          content,
          userId,
          forumId: parseInt(forumId),
        },
      });
  
      res.redirect(`/discussion/${forumId}`);
    } catch (error) {
      console.error('Error during creating comment:', error);
      res.status(500).send('Terjadi kesalahan saat menambah komentar');
    }
  });

  app.post('/discussion/:forumId/comment/:commentId/edit', middleware.requireLogin, async (req, res) => {
    const { forumId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.session.userId;
  
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: parseInt(commentId),
        },
        include: {
          user: true,
          forum: true,
        },
      });
  
      if (!comment || comment.forumId !== parseInt(forumId)) {
        return res.status(404).send('Komentar tidak ditemukan.');
      }
  
      if (comment.user.id !== userId) {
        return res.status(403).send('Anda tidak diizinkan untuk mengedit komentar ini.');
      }
  
      await prisma.comment.update({
        where: {
          id: comment.id,
        },
        data: {
          content,
        },
      });
  
      res.redirect(`/discussion/${forumId}`);
    } catch (error) {
      console.error('Error during updating comment:', error);
      res.status(500).send('Terjadi kesalahan saat memperbarui komentar');
    }
  });

  app.post('/discussion/:forumId/comment/:commentId/reply', middleware.requireLogin, async (req, res) => {
    const { forumId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.session.userId;
  
    try {
      const forum = await prisma.forum.findUnique({
        where: {
          id: parseInt(forumId),
        },
      });
  
      if (!forum) {
        return res.status(404).send('Topik tidak ditemukan.');
      }
  
      const comment = await prisma.comment.findUnique({
        where: {
          id: parseInt(commentId),
        },
        include: {
          user: true,
        },
      });
  
      if (!comment || comment.forumId !== parseInt(forumId)) {
        return res.status(404).send('Komentar tidak ditemukan.');
      }
  
      // Tambahkan reply komentar
      await prisma.comment.create({
        data: {
          content,
          userId,
          forumId: parseInt(forumId),
          parentId: parseInt(commentId),
        },
      });
  
      res.redirect(`/discussion/${forumId}`); // Redirect ke halaman diskusi setelah reply komentar
    } catch (error) {
      console.error('Error during replying to comment:', error);
      res.status(500).send('Terjadi kesalahan saat membalas komentar');
    }
  });
  

app.get('/createTopik', middleware.requireLogin, (req, res) => {
    res.render('createTopik')
})

app.post('/createTopik', middleware.requireLogin, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.session.userId;
  
    try {
      const newForum = await prisma.forum.create({
        data: {
          title,
          content,
          userId,
        },
      });
  
      res.redirect('/forum'); 
    } catch (error) {
      console.error('Error during creating forum:', error);
      res.status(500).send('Terjadi kesalahan saat membuat topik');
    }
  });

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error during logout:', err);
        res.status(500).send('Terjadi kesalahan saat logout');
      } else {
        res.redirect('/login');
      }
    });
  });


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = {
    prisma,
  };