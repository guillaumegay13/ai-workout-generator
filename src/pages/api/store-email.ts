import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ error: 'Email is required' })
        }

        try {
            // Store email with a timestamp as the key
            const timestamp = new Date().toISOString()
            await kv.set(`email:${timestamp}`, email)
            return res.status(200).json({ message: 'Email stored successfully' })
        } catch (error) {
            console.error('Error storing email:', error)
            return res.status(500).json({ error: 'Error storing email' })
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}