import Joi from 'joi';

// Chat request validation schema
export const chatSchema = Joi.object({
  message: Joi.string().required().max(2000).messages({
    'string.empty': '消息内容不能为空',
    'string.max': '消息内容不能超过2000个字符',
    'any.required': '消息内容是必需的',
  }),
  systemInstruction: Joi.string().optional().max(500).messages({
    'string.max': '系统指令不能超过500个字符',
  }),
  chatHistory: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        text: Joi.string().required(),
      })
    )
    .optional()
    .max(50)
    .messages({
      'array.max': '聊天历史不能超过50条消息',
    }),
});

// Image generation request validation schema
export const imageGenerationSchema = Joi.object({
  prompt: Joi.string().required().max(2000).messages({
    'string.empty': '提示词不能为空',
    'string.max': '提示词不能超过2000个字符',
    'any.required': '提示词是必需的',
  }),
  aspectRatio: Joi.string()
    .valid('1:1', '16:9', '9:16', '4:3', '3:4')
    .optional()
    .default('1:1')
    .messages({
      'any.only': '宽高比必须是: 1:1, 16:9, 9:16, 4:3, 或 3:4',
    }),
  referenceImage: Joi.object({
    base64: Joi.string().required(),
    mimeType: Joi.string().valid('image/jpeg', 'image/png', 'image/webp').required(),
  }).optional(),
});

// File analysis request validation schema
export const fileAnalysisSchema = Joi.object({
  fileContent: Joi.string().required().max(100000).messages({
    'string.empty': '文件内容不能为空',
    'string.max': '文件内容不能超过100KB',
    'any.required': '文件内容是必需的',
  }),
  fileName: Joi.string().optional().max(255).messages({
    'string.max': '文件名不能超过255个字符',
  }),
  prompt: Joi.string().required().max(2000).messages({
    'string.empty': '提示词不能为空',
    'string.max': '提示词不能超过2000个字符',
    'any.required': '提示词是必需的',
  }),
  systemInstruction: Joi.string().optional().max(500).messages({
    'string.max': '系统指令不能超过500个字符',
  }),
});

// Validation middleware factory
export function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: '请求参数验证失败',
        errors,
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
}
