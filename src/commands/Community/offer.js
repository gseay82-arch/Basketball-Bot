import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

const HEAD_COACH_ROLE_ID = "1512331578775310366";
const GENERAL_MANAGER_ROLE_ID = "1512331689035304960";
const PLAYER_ROLE_ID = "1512331841179353118";
const FREE_AGENT_ROLE_ID = "1512331925241598062";
const TRANSACTIONS_CHANNEL_ID = "1512328699066978455";

const NBA_TEAMS = [
  { name: "Atlanta Hawks", roleId: "1512517955303379007" },
  { name: "Boston Celtics", roleId: "1512518103861301258" },
  { name: "Brooklyn Nets", roleId: "1512518153601552636" },
  { name: "Charlotte Hornets", roleId: "1512518241413627914" },
  { name: "Chicago Bulls", roleId: "1512518314327277749" },
  { name: "Cleveland Cavaliers", roleId: "1512518366529716225" },
  { name: "Dallas Mavericks", roleId: "1512518548579422258" },
  { name: "Denver Nuggets", roleId: "1512518893502205992" },
  { name: "Detroit Pistons", roleId: "1512932453491151020" },
  { name: "Golden State Warriors", roleId: "1512932556172034180" },
  { name: "Houston Rockets", roleId: "1512932606767792298" },
  { name: "Indiana Pacers", roleId: "1512932703823990845" },
  { name: "LA Clippers", roleId: "1512932788699922523" },
  { name: "Los Angeles Lakers", roleId: "1512932857763594301" },
  { name: "Memphis Grizzlies", roleId: "1512932929540718724" },
  { name: "Miami Heat", roleId: "1512932993751318590" },
  { name: "Milwaukee Bucks", roleId: "1512933063183564860" },
  { name: "Minnesota Timberwolves", roleId: "1512933150328750170" },
  { name: "New Orleans Pelicans", roleId: "1512933198181568653" },
  { name: "New York Knicks", roleId: "1512933266993184898" },
  { name: "Oklahoma City Thunder", roleId: "1512933332818726933" },
  { name: "Orlando Magic", roleId: "1512933391677395075" },
  { name: "Philadelphia 76ers", roleId: "1512933510837567589" },
  { name: "Phoenix Suns", roleId: "1512933553334390844" },
  { name: "Portland Trail Blazers", roleId: "1512933621865124062" },
  { name: "Sacramento Kings", roleId: "1512933667901669437" },
  { name: "San Antonio Spurs", roleId: "1512933740635230269" },
  { name: "Toronto Raptors", roleId: "1512933819299266683" },
  { name: "Utah Jazz", roleId: "1512933864627241111" },
  { name: "Washington Wizards", roleId: "1512933932742611134" },
];

export default {
  data: new SlashCommandBuilder()
    .setName("offer")
    .setDescription("Send a contract offer to a player")
    .addUserOption(option =>
      option
        .setName("player")
        .setDescription("Player to offer")
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = interaction.options.getMember("player");

    const hasStaffRole =
      interaction.member.roles.cache.has(HEAD_COACH_ROLE_ID) ||
      interaction.member.roles.cache.has(GENERAL_MANAGER_ROLE_ID);

    if (!hasStaffRole) {
      return interaction.reply({
        content: "❌ You must have the Head Coach or General Manager role to offer players.",
        ephemeral: true,
      });
    }

    const staffTeam = NBA_TEAMS.find(team =>
      interaction.member.roles.cache.has(team.roleId)
    );

    if (!staffTeam) {
      return interaction.reply({
        content: "❌ You must have your team role to offer players.",
        ephemeral: true,
      });
    }

    const freshPlayer = await interaction.guild.members.fetch(player.id);

    const alreadyOnTeam = NBA_TEAMS.find(team =>
      freshPlayer.roles.cache.has(team.roleId)
    );

    if (alreadyOnTeam) {
      return interaction.reply({
        content: `❌ ${freshPlayer} is already on **${alreadyOnTeam.name}**.`,
        ephemeral: true,
      });
    }

    const acceptButton = new ButtonBuilder()
      .setCustomId(`offer_accept_${interaction.guild.id}_${staffTeam.roleId}`)
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success);

    const declineButton = new ButtonBuilder()
      .setCustomId(`offer_decline_${interaction.guild.id}_${staffTeam.roleId}`)
      .setLabel("Decline")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(acceptButton, declineButton);

    try {
      const dm = await freshPlayer.send({
        content: `🏀 **${staffTeam.name}** has offered you. Accept?`,
        components: [row],
      });

      const collector = dm.createMessageComponentCollector({
        time: 24 * 60 * 60 * 1000,
        max: 1,
      });

      collector.on("collect", async buttonInteraction => {
        if (buttonInteraction.user.id !== freshPlayer.id) {
          return buttonInteraction.reply({
            content: "❌ This offer is not for you.",
            ephemeral: true,
          });
        }

        if (buttonInteraction.customId.startsWith("offer_decline")) {
          await buttonInteraction.update({
            content: `❌ You declined the offer from **${staffTeam.name}**.`,
            components: [],
          });

          return;
        }

        const guild = await interaction.client.guilds.fetch(interaction.guild.id);
        const guildMember = await guild.members.fetch(freshPlayer.id);

        try {
          await guildMember.roles.add([PLAYER_ROLE_ID, staffTeam.roleId]);
          await guildMember.roles.remove(FREE_AGENT_ROLE_ID).catch(() => null);
        } catch (error) {
          console.error(error);

          return buttonInteraction.update({
            content: "❌ I could not update your roles. Please contact league staff.",
            components: [],
          });
        }

        const transactionsChannel = guild.channels.cache.get(TRANSACTIONS_CHANNEL_ID);

        if (transactionsChannel) {
          await transactionsChannel.send(
            `✅ **ACCEPTED OFFER:** ${guildMember} has accepted their offer from **${staffTeam.name}**.`
          );
        }

        await buttonInteraction.update({
          content: `✅ You accepted the offer from **${staffTeam.name}**!`,
          components: [],
        });
      });

      return interaction.reply({
        content: `📨 Offer sent to ${freshPlayer} from **${staffTeam.name}**.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);

      return interaction.reply({
        content: "❌ I could not DM that player. They may have DMs closed.",
        ephemeral: true,
      });
    }
  },
};
