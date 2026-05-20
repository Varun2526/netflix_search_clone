import Content from "../models/Content.model.js";

export const searchContent = async (req, res) => {
    try {
        const query = req.query.q;
        const results = await Content.find({ $text: { $search: query } }).limit(20);

        res.status(200).json({ success: true, results, });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, });
    }
};