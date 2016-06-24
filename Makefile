deploy:
	node_modules/.bin/browserify index.jsx > dist/index.js
	cp style.css dist/style.css
	(cd dist; git commit -am "release"; git push)
