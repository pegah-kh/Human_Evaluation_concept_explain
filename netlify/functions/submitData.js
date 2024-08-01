const fetch = require('node-fetch');
const atob = require('atob');
const btoa = require('btoa');

exports.handler = async function(event, context) {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubUsername = process.env.GITHUB_USERNAME;
    const githubRepo = process.env.GITHUB_REPO;
    const dataFilePath = 'data.json';

    const selectedWordsStats = JSON.parse(event.body);

    try {
        const response = await fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${dataFilePath}`, {
            headers: {
                Authorization: `token ${githubToken}`
            }
        });
        const data = await response.json();
        const fileContent = atob(data.content);
        const jsonData = fileContent ? JSON.parse(fileContent) : [];
        jsonData.push(...selectedWordsStats);

        const updatedContent = btoa(JSON.stringify(jsonData, null, 2));

        const result = await fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${dataFilePath}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update evaluation data',
                content: updatedContent,
                sha: data.sha
            })
        });

        return {
            statusCode: 200,
            body: JSON.stringify(await result.json())
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
