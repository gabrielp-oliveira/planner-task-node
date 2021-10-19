# planner-task-node
 
<p> If you want to take a look on all screens of the App, click <a href="#" target="_blank">here.</a></p>
<p><strong>OBS:. use google chrome or firefox for more efficient.</strong></p>
<h2>Goal</h2> 
<p><i>"Use my knowledge to improve and test my skills as a programmer".:rocket:</i></p>

<p>This project is part of my portfolio, so feel free to get in touch for feedback on the code, structure or other reason that will help me become a better programmer!</p>

<span>E-mail: <a>gabriel.pso100@gmail.com</a ></span><br>
<span><a target="_blank" href="https://www.linkedin.com/in/gabriel-97-oliveira">linkedin</a></span><br>

<h2>Observations</h2>
<Strong></strong>
<p>inspired in the <Strong>Microsoft Planner</strong>, this tool helps you to <Strong>create</strong> a <Strong>simple</strong> and <Strong>visual</strong> way to organize work that is updated in <Strong>real time </strong>for the entire team.</p>

<p>If you want to check the Front-end repository, click <a target="_blank" href="https://github.com/gabrielp-oliveira/planner-task"> here</a>.</p>

<p>
This app is hosted on <strong>heroku free plan</strong>, meaning that on the initial load, the server mat neet to start which can cause a <strong>delay</strong>.
</p>

	
<h2>Functionalities</h2>
• Register and login a personal account, with email authentication and possibility to change the pasword.<br>
• Saved all the tasks and planner in a database.<br>
• update all changes to everyone connected in that planner at the same time.<br>
• limit the acess of a user depending of her acess.<br><br>

<h2>Cloning the Repository</h2>
<span>$ git clone https://github.com/gabrielp-oliveira/planner-task-node</span><br>
<span>$ cd cd planner-task-node</span><br>
<span>$ npm install</span>
<br>

<h2>setting the app</h2>
Now, some things are importants:<br>
<p>if you run this app in local environment, you have to had install the <strong>mongodb and node js</strong>  to get everything in work.</p>
<p>you can find the methodology to <strong>cloning and config the front-end repository <a target="_blank" href="https://github.com/gabrielp-oliveira/planner-task"> here</a></strong>.</p>

<p>It was utilized the <strong>google cloud API</strong> to create the mailer service, so, you can get more info about it <a target="_blank" href="https://cloud.google.com/google/api">here</a>.</p>

<p>its important create a <strong>.env</strong>  file in the root application with the following variables:<p>
<strong>URL </strong> <i>---- </i>its the front-end, this url will be sended by email, when the user validate the email or change de password, this url will be used to redirect to the page, you can leave it in blank, that will be setup by default to: http://localhost:3000<br>
<strong>MONGO_DB_ACESS </strong> <i>---- </i>its the mongo database acess, if you run this project in a local enviroment, you can leave it in blank, that will be setup by default to : mongodb://localhost/stp.<br>
<strong>TOKEN_HASH </strong> <i>---- </i>is the token that will be used to encode the user's password, you can randomly configure a sequence of characters to form that token.<br>
<strong>Email </strong> <i>---- </i>this its the email that will be used to delivery the validate code and forget code. that its no default value on this.<br>
<strong>clientId </strong> <i>---- </i>you will get this value on the google api, so read the link above for more information.<br>
<strong>refresh_Token </strong> <i>---- </i>you will get this value on the google api, so read the link above for more information.<br>
<strong>clientSecret </strong> <i>---- </i>you will get this value on the google api, so read the link above for more information.<br><br>




<h2>Built With</h2>
<span>• axios </span><br>
<span>• bcryptjs </span><br>
<span>• body-parser</span><br>
<span>• cors</span><br>
<span>• dotenv</span><br>
<span>• express</span><br>
<span>• jsonwebtoken</span><br>
<span>• mongoose</span><br>
<span>• Socket.IO</span><br>
<span>• nodemailer</span><br><br>

<hr>
<span>E-mail: <a>gabriel.pso100@gmail.com</a ></span><br>

<span><a href ="http://www.linkedin.com/in/gabriel-97-oliveira" target="_blank">LinkedIn</a> </span><br>

:thumbsup:
 