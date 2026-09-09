"use client";

import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  InputProps,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { FaLevelUpAlt } from "react-icons/fa";
import z from "zod";
// import HCaptcha from "@hcaptcha/react-hcaptcha";

const schema = z.object({
  email: z.string().email().min(1),
  subject: z.string().min(1),
  message: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const toast = useToast();

  const inputStyle: InputProps = {
    my: 1,
    p: 3,
    borderBottomColor: "primary",
    focusBorderColor: "primary",
    borderBottom: "2px",
    size: "md",
    _placeholder: { color: "primary", opacity: 0.5 },
  };

  // for captcha
  //   const onHCaptchaChange = (token: any) => {
  //     setValue("h-captcha-response", token);
  //   };

  async function submitForm({ email, subject, message }: FormData) {
    toast.promise(
      axios.post(
        "/api/email",
        { email, subject, message },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      ),
      {
        success: { title: "Message Sent!", description: "Looks great" },
        error: {
          title: "Fail to send!",
          description: "Something is wrong",
        },
        loading: { title: "Sending", description: "Please wait" },
      }
    );
  }

  return (
    <Box width={{ base: "100%", lg: "50%" }}>
      <form onSubmit={handleSubmit(submitForm)}>
        <Box background="accent" padding={5} borderRadius={"3xl"}>
          <Flex alignItems="center" position={"relative"}>
            <Text
              fontWeight="bold"
              position={"absolute"}
              left={3}
              fontSize={{ base: "sm", sm: "md" }}
            >
              To:&nbsp;
            </Text>

            <Text
              bg="#7BB1DE"
              px={2}
              borderRadius="md"
              as="u"
              fontSize={{ base: "xs", sm: "md" }}
              position={"absolute"}
              left={{ base: 10, sm: 12 }}
            >
              ubccookingclubinfo@gmail.com
            </Text>
            <Input
              variant={"flushed"}
              disabled
              _disabled={{
                borderColor: "primary",
              }}
              {...inputStyle}
            />
          </Flex>
          <Input
            variant={"flushed"}
            placeholder="Email"
            {...register("email")}
            {...inputStyle}
            isInvalid={Boolean(errors.email)}
          />

          <Input
            variant={"flushed"}
            placeholder="Subject"
            {...register("subject")}
            {...inputStyle}
            isInvalid={Boolean(errors.subject)}
          />

          <Textarea
            variant={"plain"}
            size="md"
            placeholder="Your Message"
            {...register("message")}
            background={"transparent"}
            height={180}
            resize={"none"}
            m={inputStyle.m}
            p={inputStyle.p}
            _placeholder={inputStyle._placeholder}
            isInvalid={Boolean(errors.message)}
          />
          {/* <Flex flexDirection="column" placeContent="center">
            <HCaptcha
              sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"
              reCaptchaCompat={false}
              onVerify={onHCaptchaChange}
            />
          </Flex> */}
        </Box>

        <Button
          position={"relative"}
          type="submit"
          borderRadius="full"
          backgroundColor="primary"
          color="background"
          width="100%"
          m={1}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          _hover={{ filter: "brightness(1.1)" }}
          _active={{ filter: "brightness(1.5)" }}
          transition={"0.5s"}
        >
          Send to the Kitchen!{" "}
          <Icon
            as={FaLevelUpAlt}
            transform={"rotate(90deg)"}
            boxSize={5}
            position={"absolute"}
            right={5}
          />
        </Button>
      </form>
    </Box>
  );
}
