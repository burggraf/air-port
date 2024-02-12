const express = require('express')
const { exec } = require('child_process')
const app = express()
const port = 5000
const axios = require('axios')

app.get('/favicon.ico', (req, res) => {
	return res.status(200).send('ok')
})
function execAsync(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error)
				return
			}
			resolve({ stdout, stderr })
		})
	})
}
app.get('*', async (req, res) => {
    tries = 0;
	console.log('handle error here')
	console.log(req.hostname)
	console.log(req.path)
	const originalUri = req.get('X-Original-URI')
	console.log('Original URI:', originalUri)
	console.log('Original Port:', req.get('X-Original-Port'))
	const { stdout, stderr } = await execAsync(
		'sudo /home/ubuntu/run.sh ' + req.get('X-Original-Port')
	)
	// exec('sudo /home/ubuntu/run.sh ' + req.get('X-Original-Port'), async (error, stdout, stderr) => {
	if (stderr) {
        if (stderr.indexOf('already in use by container') > -1) {
            try {
                let URI = req.get('X-Original-URI');
                if (URI.endsWith('/_')) { URI += '/'; }
                console.log(
                    'calling axios:',
                    `http://localhost:${req.get('X-Original-Port')}${URI}`
                )
                const response = await axios({
                    method: req.method,
                    url: `http://localhost:${req.get('X-Original-Port')}${URI}`,
                    data: req.body,
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                })        
                return res.status(response.status).send(response.data)                
            } catch (error) {
                // Handle errors
                console.log('error', error)
                return res.status(500).send('Error forwarding the request' + JSON.stringify(error))
            }    
        } else {
            console.error(`Execution error: ${stderr}`)
            return res.status(500).send('Error executing the script')    
        }
	} else {
        if (stdout.includes('OK')) {
			try {
                let URI = req.get('X-Original-URI');
                if (URI.endsWith('/_')) { URI += '/'; }
                console.log(
                    'calling axios:',
                    `http://localhost:${req.get('X-Original-Port')}${URI}`
                )
                const response = await axios({
                    method: req.method,
                    url: `http://localhost:${req.get('X-Original-Port')}${URI}`,
                    data: req.body,
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                })        
                return res.status(response.status).send(response.data)                
			} catch (error) {
				// Handle errors
				console.log('error', error)
				return res.status(500).send('Error forwarding the request' + JSON.stringify(error))
			}
		} else {
			return res.status(500).send('run.sh did not finish correctly')
		}
	}
})
// return res.status(500).send('Error was not handled');

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
