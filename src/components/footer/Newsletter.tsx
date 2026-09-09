import {
  chakra,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { FaAngleRight } from "react-icons/fa";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const schema = z.object({
  email: z.string().email().min(1),
});

type FormData = z.infer<typeof schema>;

export default function Newsletter() {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const toast = useToast();

  const onSubmit = async ({ email }: FormData) => {
    toast.promise(axios.post("/api/newsletter", { email }), {
      success: { title: "Newsletter Subcribed!", description: "Looks great" },
      error: { title: "Fail to Subscribe!", description: "Something is wrong" },
      loading: { title: "Subscribing", description: "Please wait" },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl
        isInvalid={Boolean(errors.email)}
        position={"relative"}
        zIndex={10}
      >
        <Heading
          as={FormLabel}
          htmlFor="email"
          position={"relative"}
          color={"background"}
          fontFamily={"body"}
          letterSpacing={"1px"}
          zIndex={10}
          fontSize={{ base: "xl", sm: "3xl", lg: "4xl" }}
          textAlign={{ base: "center", md: "start" }}
        >
          Sign up for{" "}
          <chakra.span
            color={"secondary"}
            fontFamily={"heading"}
            fontWeight={"regular"}
            zIndex={"inherit"}
          >
            newsletter!
          </chakra.span>
        </Heading>
        <InputGroup position={"relative"}>
          <InputRightElement
            zIndex={20}
            position={"absolute"}
            right={3}
            top={"36%"}
          >
            <IconButton
              aria-label="btn"
              icon={<FaAngleRight />}
              boxSize={10}
              background={"primary"}
              color={"background"}
              _hover={{ filter: "brightness(110%)" }}
              _active={{
                transform: "scale(0.98)",
              }}
              rounded={"xl"}
              type="submit"
              isLoading={isSubmitting}
            />
          </InputRightElement>
          <Input
            id="email"
            type="email"
            {...register("email")}
            position={"relative"}
            placeholder="Enter your email"
            width={"100%"}
            height={"3.5rem"}
            mt={5}
            rounded={"xl"}
            fontSize={{ base: "md", sm: "2xl" }}
            background={"background"}
            _focus={{
              background: "background",
              borderColor: "accent",
              zIndex: 11,
            }}
            _placeholder={{ color: "primary", background: "background" }}
            zIndex={10}
          />
        </InputGroup>
      </FormControl>
    </form>
  );
}
