import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import * as crypto from 'crypto';
  import * as bcrypt from 'bcrypt';
  import { MailerService } from '@nestjs-modules/mailer';
  import { JwtService } from '@nestjs/jwt';
import { Buyer } from 'src/buyer/entity/buyer.entity';
import { OtpBuyer } from '../entity/otp.buyer.entity';
  
  @Injectable()
  export class OtpBuyerService {
    constructor(
      private readonly mailerService: MailerService,
      @Inject('JwtForgotService') private readonly jwtForgotService: JwtService,
      @InjectRepository(OtpBuyer) private readonly otpRepository: Repository<OtpBuyer>,
      @InjectRepository(Buyer) private readonly userRepository: Repository<Buyer>,
    ) {}
  
    async generateOtp(email: string): Promise<OtpBuyer> {
      try {
        const user = await this.userRepository.findOneBy({ email: email });
        if (!user) {
          throw new NotFoundException('User not found');
        }
  
        const otp = crypto.randomInt(10000, 99999).toString(); // Generate OTP
        const expiryDate = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        const hashedOtp = await bcrypt.hash(otp, 10); // Hash OTP sebelum disimpan
  
        // Cek apakah sudah ada OTP untuk user yang sama
        const existingOtp = await this.otpRepository.findOneBy({
          buyerId: user.id,
        });
  
        const newOtp = this.otpRepository.create({
          otp: hashedOtp,
          buyerId: user.id,
          expiresAt: expiryDate,
        });
  
        if (existingOtp) {
          await this.otpRepository.delete({ id: existingOtp.id });
        }
        await this.sendOtpEmail(email, otp);
        await this.otpRepository.save(newOtp);
        return newOtp;
  
        // Kirim OTP melalui email setelah OTP berhasil disimpan
  
        // Kembalikan entri OTP yang tersimpan (baru atau diperbarui)
      } catch (error) {
        console.error('Error in generateOtp:', error);
  
        // Jika gagal kirim email, tangani error secara spesifik
        if (error.message.includes('Failed to send OTP email')) {
          throw new InternalServerErrorException('Failed to send OTP email.');
        }
  
        // Tangani error lain yang mungkin muncul
        throw new InternalServerErrorException('Error generating OTP.');
      }
    }
  
    async validateOtpVerification(
      otpCode: string,
      email: string,
    ): Promise<boolean> {
      const queryBuilder = this.otpRepository
        .createQueryBuilder('otp')
        .innerJoin(Buyer, 'buyer', 'otp.buyerId = buyer.id')
        .where('buyer.email = :email', { email });
  
      const otp = await queryBuilder.getOne();
      if (!otp) {
        throw new NotFoundException('OTP not found for this user.');
      }
      const isMatch = await bcrypt.compare(otpCode, otp.otp);
      if (!isMatch) {
        throw new BadRequestException('Invalid OTP.');
      }
      if (new Date() > otp.expiresAt) {
        await this.otpRepository.delete(otp.id);
        throw new BadRequestException('Expired OTP.');
      }
      await this.userRepository.update(
        { email: email },
        { verified_at: new Date() },
      );
      await this.otpRepository.delete(otp.id);
      console.log('OTP verification successful');
      return true;
    }
    async verifyOtpForgot(otpCode: string, email: string): Promise<string> {
      const queryBuilder = this.otpRepository
        .createQueryBuilder('otp')
        .innerJoin(Buyer, 'buyer', 'otp.buyerId = buyer.id')
        .where('buyer.email = :email', { email });
  
      const otp = await queryBuilder.getOne();
      if (!otp) {
        throw new NotFoundException('OTP not found for this user.');
      }
      const isMatch = await bcrypt.compare(otpCode, otp.otp);
      if (!isMatch) {
        throw new BadRequestException('Invalid OTP.');
      }
      if (new Date() > otp.expiresAt) {
        await this.otpRepository.delete(otp.id);
        throw new BadRequestException('Expired OTP.');
      }
      await this.userRepository.update(
        { email: email },
        { verified_at: new Date() },
      );
      await this.otpRepository.delete(otp.id);
      console.log('OTP verification successful');
  
      const payload = { id: otp.buyerId, email: email, role: 'buyer' };
      const access_token = await this.jwtForgotService.sign(payload);
      return access_token;
    }
    private async sendOtpEmail(to: string, otp: string): Promise<void> {
      try {
        await this.mailerService.sendMail({
          to,
          subject: 'Your OTP Code',
          template: 'otp',
          context: { otp },
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Log error jika perlu
        throw new InternalServerErrorException('Could not send OTP email.');
      }
    }
  }
  