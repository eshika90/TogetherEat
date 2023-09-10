import { IsNumber,IsString,Length  } from "class-validator";

export class updateCategoryDto{
    @IsString()

    @Length(5, 15)
    readonly category_name: string;

    @IsNumber()
    readonly top_category_id: number;
    
    @IsNumber()
    readonly is_admin: number;

    @IsNumber()
    readonly user:number;
    
}