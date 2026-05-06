from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME="itsmike0909@gmail.com",
    MAIL_PASSWORD="dvom lcou sftc jnrw",
    MAIL_FROM="itsmike0909@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False
)

async def send_otp_email(email, otp):

    message = MessageSchema(
        subject="Research Dost OTP Verification",
        recipients=[email],
        body=f"Your OTP is: {otp}",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)