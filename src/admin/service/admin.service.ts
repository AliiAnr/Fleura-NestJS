import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Admin } from "../entity/admin.entity";
import * as bcrypt from "bcrypt";
import { RegisterAdminDto } from "../dto/register-admin.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";

@Injectable()
export class AdminService {
  constructor(
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Admin) private readonly userRepository: Repository<Admin>
  ) {}

//   async createUser(request: RegisterAdminDto): Promise<Admin> {
//     try {
//       await this.validateCreateUserRequest(request);
//       const user = this.userRepository.create({
//         ...request,
//         password: await bcrypt.hash(request.password, 10),
//       });
//       const savedUser = await this.userRepository.save(user);
//       return savedUser;
//     } catch (error) {
//       if (error instanceof UnprocessableEntityException) {
//         throw error;
//       }
//       throw new Error("Failed to create admin.");
//     }
//   }
//   private async validateCreateUserRequest(request: RegisterAdminDto) {
//     try {
//       const user = await this.userRepository.findOne({
//         where: { name: request.name },
//       });

//       if (user) {
//         console.log("error");
//         throw new UnprocessableEntityException("Admin already exists.");
//       }
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (err) {
//       if (err instanceof UnprocessableEntityException) {
//         throw err;
//       }

//       console.log("error: Unexpected error");
//       throw new Error("Error validating user request.");
//     }
//   }
}
