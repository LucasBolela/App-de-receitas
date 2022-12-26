export default function filePath() {
    const path = process.env.HOSTNAME || 'http://localhost:' + process.env.PORT || 3000 + '/file/'
    return path;
}