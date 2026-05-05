const { generateAvatarVideo, getAvatarStatus } = require('../services/avatarService');

exports.generateAvatar = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await generateAvatarVideo(text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate avatar' });
  }
};

exports.checkAvatarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getAvatarStatus(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status' });
  }
};
